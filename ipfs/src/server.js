'use strict';

require('date-utils');
const async = require('async');
const express = require('express');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
const IpfsHttpClient = require('ipfs-http-client');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const testAddress = 'makuhari-test';
const citizenAddress = 'makuhari-citizen-test';
const topicAddress = 'makuhari-topic-test';
const infoAddress = 'makuhari-info-test1.3';

const initIPFSInstance = async () => {
  return await IpfsHttpClient.create({
    host: 'ipfs0',
    port: '5001',
    protocol: 'http',
    EXPERIMENTAL: {
      pubsub: true,
    },
    replicate: true,
  });
  // return await IPFS.create({
  //   repo: './orbitdb/ipfs',
  //   start: true,
  //   EXPERIMENTAL: {
  //     pubsub: true,
  //   },
  // })
};

// App
const app = express();
app.use(express.json());

//------------------------------------------------------------
//--- Test
//------------------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).send('Hello Makuhari City');
});

app.post('/', (req, res) => {
  const text = req.body;
  postTest.push({ res: res, text: text });
});

const postTest = async.queue((params, callback) => {
  let text = params.text;
  if (text === undefined) {
    params.res.status(501).send('test is invalid');
  }
  let orbitdb;
  initIPFSInstance()
    .then(async (ipfs) => {
      orbitdb = await OrbitDB.createInstance(ipfs);

      // load info database
      const db = await orbitdb.log(testAddress);
      await db.load();
      // add text
      let hash = await db.add(JSON.stringify(text));
      console.log("registration success");
      console.log(hash);

      await orbitdb.disconnect();

      params.res.status(201).send(hash);
    })
    .catch(async (error) => {
      if (orbitdb !== undefined) {
        await orbitdb.disconnect();
      }
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      callback();
    });
}, 1);

//------------------------------------------------------------
//--- Citizen
//------------------------------------------------------------

//--- get all userData
app.get('/citizen/', (req, res) => {
  getCitizenAll.push({ req: req, res: res });
});

const getCitizenAll = async.queue((params, callback) => {
  // console.log('start----------------getCitizenAll');
  initIPFSInstance()
    .then(async (ipfs) => {
      const orbitdb = await OrbitDB.createInstance(ipfs);
      const db = await orbitdb.kvstore(citizenAddress, { overwrite: false });
      await db.load();

      const value = db.all;
      await orbitdb.disconnect();
      params.res.status(200).send(value);
    })
    .catch((error) => {
      console.log('error');
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      // console.log('end----------------getCitizenAll');
      callback();
    });
}, 1);

//--- get specified userData
app.get('/citizen/:uid/', (req, res) => {
  getCitizen.push({ req: req, res: res });
});

const getCitizen = async.queue((params, callback) => {
  // console.log('start----------------getCitizen');
  initIPFSInstance()
    .then(async (ipfs) => {
      console.log(params.req.params.uid);
      const orbitdb = await OrbitDB.createInstance(ipfs);
      const db = await orbitdb.kvstore(citizenAddress, { overwrite: false });
      await db.load();

      var value = db.get(params.req.params.uid);
      await orbitdb.disconnect();

      if (value === undefined) {
        params.res.status(204).send('no citizen found for given uid');
      }
      params.res.status(200).send(value);
    })
    .catch((error) => {
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      // console.log('end----------------getCitizen');
      callback();
    });
}, 1);

//--- put specified user data
app.post('/citizen/', (req, res) => {
  console.log(req.body);
  const uid = req.body.uid;
  const data = req.body.data;
  postCitizen.push({ res: res, uid: uid, data, data });
});

const postCitizen = async.queue((params, callback) => {
  // console.log('start----------------postCitizen');
  const uid = params.uid;
  const data = params.data;
  initIPFSInstance()
    .then(async (ipfs) => {
      const orbitdb = await OrbitDB.createInstance(ipfs);
      try {
        const db = await orbitdb.kvstore(citizenAddress, { overwrite: false });
        await db.load();

        const hash = await db.put(uid, {
          data: data,
          created: '2021/06/26',
        });
        console.log(hash);

        await orbitdb.disconnect();

        params.res.status(201).send(hash);
      } catch (error) {
        console.log(error);
        await orbitdb.disconnect();
        params.res.status(500).send(error);
      }
    })
    .catch((error) => {
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      // console.log('end----------------postCitizen');
      callback();
    });
}, 1);

//------------------------------------------------------------
//--- Topic
//------------------------------------------------------------

//--- get all topic
app.get('/topic/', (req, res) => {
  getTopicAll.push({ req: req, res: res });
});

const getTopicAll = async.queue((params, callback) => {
  initIPFSInstance()
    .then(async (ipfs) => {
      const orbitdb = await OrbitDB.createInstance(ipfs);
      const db = await orbitdb.kvstore(topicAddress, { overwrite: false });
      await db.load();

      const value = db.all;
      await orbitdb.disconnect();
      params.res.status(200).send(value);
    })
    .catch((error) => {
      console.log('error');
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      callback();
    });
}, 1);

//--- get specified topic
app.get('/topic/:uid/', (req, res) => {
  const uid = req.params.uid;
  getTopic.push({ res: res, uid: uid });
});

const getTopic = async.queue((params, callback) => {
  initIPFSInstance()
    .then(async (ipfs) => {
      console.log(params.uid);
      const orbitdb = await OrbitDB.createInstance(ipfs);
      const db = await orbitdb.kvstore(topicAddress, { overwrite: false });
      await db.load();

      var value = db.get(params.uid);
      await orbitdb.disconnect();
      if (value === undefined) {
        params.res.status(204).send('no tag found for given uid');
      }
      params.res.status(200).send(value);
    })
    .catch((error) => {
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      callback();
    });
}, 1);

const postTopic = async.queue((params, callback) => {
  const uid = params.uid;
  const hash = params.hash;
  const title = params.title;
  let orbitdb;
  initIPFSInstance()
    .then(async (ipfs) => {
      orbitdb = await OrbitDB.createInstance(ipfs);
      const db = await orbitdb.kvstore(topicAddress, { overwrite: false });
      await db.load();

      const rc = await db.put(uid, {
        hash: hash,
        title: title,
      });
      console.log(rc);

      await orbitdb.disconnect();

      params.res.status(201).send(rc);
    })
    .catch(async (error) => {
      if (orbitdb !== undefined) {
        await orbitdb.disconnect();
      }
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      callback();
    });
}, 1);

//------------------------------------------------------------
//--- Info
//------------------------------------------------------------

//--- get specified info
app.get('/info/:hash/', (req, res) => {
  const hash = req.params.hash;
  getInfo.push({ res: res, hash: hash });
});

const getInfo = async.queue((params, callback) => {
  const hash = params.hash;
  let orbitdb;
  initIPFSInstance()
    .then(async (ipfs) => {
      console.log(hash);
      orbitdb = await OrbitDB.createInstance(ipfs);
      const db = await orbitdb.log(infoAddress);
      await db.load();

      var value = db.get(hash);
      await orbitdb.disconnect();
      if (value === undefined) {
        params.res.status(204).send('no vote info found for given hash');
      }
      params.res.status(200).send(value.payload.value);
    })
    .catch(async (error) => {
      if (orbitdb !== undefined) {
        await orbitdb.disconnect();
      }
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      callback();
    });
}, 1);

//--- put specified user data
app.post('/info/', (req, res) => {
  const info = req.body.info;
  postInfo.push({ res: res, info: info });
});

const postInfo = async.queue((params, callback) => {
  let info = params.info;
  console.log(info);
  if (info === undefined) {
    params.res.status(501).send('info is invalid');
  }
  let orbitdb;
  initIPFSInstance()
    .then(async (ipfs) => {
      orbitdb = await OrbitDB.createInstance(ipfs);

      // load info database
      const dbInfo = await orbitdb.log(infoAddress);
      await dbInfo.load();
      // add Info
      let hash = await dbInfo.add(JSON.stringify(info));
      console.log(hash);

      // load tag database
      const dbTag = await orbitdb.kvstore(topicAddress, { overwrite: false });
      await dbTag.load();
      // check there is a tag
      var tags = dbTag.all;
      for (var uid in tags) {
        console.log(uid);
        if (tags[uid].title === info.title) {
          if (tags[uid].hash === hash) {
            params.res.status(204).send('vote info already saved');
          }

          // update parent hash
          info.parent = tags[uid].hash;
          // update Info
          hash = await dbInfo.add(JSON.stringify(info));
          console.log(hash);
          break;
        }
      }
      console.log(tags);

      // add Tag
      const rc = await dbTag.put(info.uid, {
        hash: hash,
        title: info.title,
      });
      console.log(rc);

      await orbitdb.disconnect();

      params.res.status(201).send(hash);
    })
    .catch(async (error) => {
      if (orbitdb !== undefined) {
        await orbitdb.disconnect();
      }
      console.log(error);
      params.res.status(500).send(error);
    })
    .finally(() => {
      callback();
    });
}, 1);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
