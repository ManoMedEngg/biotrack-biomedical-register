/* BioTrack shared-data bridge. Uses Supabase publishable key + database RLS. */
(function () {
  let client, user, role, syncTimer, applying = false;
  const get = key => JSON.parse(localStorage.getItem(key) || '[]');
  const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const canEdit = () => role === 'boss';
  const localId = x => x.id || `web-${crypto.randomUUID()}`;

  async function pushAll() {
    if (!client || applying || !canEdit()) return;
    const localEquipment = get('biotrack-equipment');
    const equipment = localEquipment.map(x=>({client_id:localId(x),department:x.department||'',name:x.name||'',make:x.make||null,model:x.model||null,serial:x.serial||null,asset_code:x.assetCode||null}));
    if (equipment.length) await client.from('equipment').upsert(equipment,{onConflict:'client_id'});
    const {data:dbEquipment}=await client.from('equipment').select('id,client_id');
    const dbId=new Map((dbEquipment||[]).map(x=>[x.client_id,x.id]));
    const history=get('biotrack-history').map(x=>({client_id:localId(x),equipment_id:dbId.get(x.equipmentId),event_date:x.date,event_type:x.type,details:x.details,provider:x.provider||null,next_due:x.nextDue||null})).filter(x=>x.equipment_id&&x.event_date);
    const stock=get('biotrack-stock').map(x=>({client_id:localId(x),item:x.item||x.product||'',quantity:Number(x.quantity)||0,direction:x.direction==='issued'?'Issued':x.direction==='received'?'Received':x.direction,vendor:x.vendor||x.party||null,contact_person:x.contactPerson||null,contact_number:x.contactNumber||null,department:x.department||null,movement_date:x.date||null,person:x.person||null,notes:x.notes||x.note||null})).filter(x=>x.item&&x.quantity>0&&x.movement_date&&['Received','Issued'].includes(x.direction));
    const localLogs=get('biotrack-logbook').length?get('biotrack-logbook'):get('biotrack-logs');
    const logs=localLogs.map(x=>({client_id:localId(x),log_date:x.date,category:x.category||'Other',scope:x.scope||null,details:x.details||'',author_id:user.id})).filter(x=>x.log_date&&x.details);
    if(history.length)await client.from('equipment_history').upsert(history,{onConflict:'client_id'});
    if(stock.length)await client.from('stock_movements').upsert(stock,{onConflict:'client_id'});
    if(logs.length)await client.from('daily_logs').upsert(logs,{onConflict:'client_id'});
  }
  async function pushComments() {
    if (!client || applying || !canEdit()) return;
    const comments=get('biotrack-comments').map(x=>({client_id:localId(x),target_type:String(x.target||'').startsWith('stock:')?'stock':'daily_log',target_id:x.target||'',body:x.text||'',author_id:user.id})).filter(x=>x.target_id&&x.body);
    if(comments.length) await client.from('comments').upsert(comments,{onConflict:'client_id'});
  }
  async function pullAll() {
    const [eq,hist,stock,logs,comments]=await Promise.all([client.from('equipment').select('*'),client.from('equipment_history').select('*'),client.from('stock_movements').select('*'),client.from('daily_logs').select('*'),client.from('comments').select('*')]);
    const rows=eq.data||[];
    const ids=new Map(rows.map(x=>[x.id,x.client_id]));
    set('biotrack-equipment',rows.map(x=>({id:x.client_id,department:x.department,name:x.name,make:x.make||'',model:x.model||'',serial:x.serial||'',assetCode:x.asset_code||''})));
    set('biotrack-history',(hist.data||[]).map(x=>({id:x.client_id,equipmentId:ids.get(x.equipment_id),date:x.event_date,type:x.event_type,details:x.details,provider:x.provider||'',nextDue:x.next_due||''})));
    set('biotrack-stock',(stock.data||[]).map(x=>({id:x.client_id,product:x.item,quantity:x.quantity,direction:x.direction.toLowerCase(),party:x.vendor||x.department||'',contactPerson:x.contact_person||'',contactNumber:x.contact_number||'',date:x.movement_date,note:x.notes||x.person||''})));
    const localLogs=(logs.data||[]).map(x=>({id:x.client_id,date:x.log_date,category:x.category,scope:x.scope||'',text:x.details,author:'Shared team'}));set('biotrack-logbook',localLogs);set('biotrack-logs',localLogs);
    set('biotrack-comments',(comments.data||[]).map(x=>({id:x.client_id,target:x.target_id,targetLabel:x.target_type,author:'Shared team',text:x.body,date:x.created_at,read:!!x.read_at})));
    return rows.length > 0;
  }
  async function start(db,signedUser,profile){
    client=db;user=signedUser;role=profile.role;
    applying=true;
    let found=await pullAll();
    applying=false;
    if(!found&&canEdit()){
      await pushAll();
      applying=true;
      await pullAll();
      applying=false;
    }
    window.BioTrackApp?.refreshFromCloud();
    window.addEventListener('biotrack-local-change',()=>{
      clearTimeout(syncTimer);
      syncTimer=setTimeout(()=>{pushAll();pushComments()},450);
    });
    let refreshTimer;
    const refresh=()=>{
      clearTimeout(refreshTimer);
      refreshTimer=setTimeout(async()=>{
        applying=true;
        await pullAll();
        applying=false;
        window.BioTrackApp?.refreshFromCloud();
      },800);
    };
    client.channel('biotrack-live')
      .on('postgres_changes',{event:'*',schema:'public',table:'equipment'},refresh)
      .on('postgres_changes',{event:'*',schema:'public',table:'equipment_history'},refresh)
      .on('postgres_changes',{event:'*',schema:'public',table:'stock_movements'},refresh)
      .on('postgres_changes',{event:'*',schema:'public',table:'daily_logs'},refresh)
      .on('postgres_changes',{event:'*',schema:'public',table:'comments'},refresh)
      .subscribe();
  }
  window.BioTrackCloud={start};
})();
