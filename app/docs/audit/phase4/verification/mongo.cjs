// Starts a genuine disposable mongod; never reads application environment files.
const {MongoMemoryServer}=require('./evidence-tools/node_modules/mongodb-memory-server');
const fs=require('fs');
(async()=>{
 const mongo=await MongoMemoryServer.create({binary:{version:'8.0.16'},instance:{ip:'127.0.0.1',dbName:'medtech_audit_isolated'}});
 fs.writeFileSync(__dirname+'/mongo-runtime.json',JSON.stringify({uri:mongo.getUri(),database:'medtech_audit_isolated',version:'8.0.16',disposable:true},null,2));
 console.log('Disposable MongoDB ready: '+mongo.getUri());
 const stop=async()=>{await mongo.stop();process.exit(0)};
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
 await new Promise(()=>{});
})().catch(e=>{console.error(e);process.exit(1)});
