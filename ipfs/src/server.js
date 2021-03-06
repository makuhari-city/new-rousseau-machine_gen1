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
const logAddress = 'makuhari-log-test';
const citizenAddress = 'makuhari-citizen-test';
const topicAddress = 'makuhari-topic-test';
const infoAddress = 'makuhari-info-test';

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

let orbitdb;

initIPFSInstance()
  .then(async (ipfs) => {
    orbitdb = await OrbitDB.createInstance(ipfs);
  })
  .catch((error) => {
    console.log('error');
    console.log(error);
  });

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

  initIPFSInstance()
    .then(async (ipfs) => {
      // load info database
      const db = await orbitdb.log(testAddress);
      await db.load();
      // add text
      let hash = await db.add(JSON.stringify(text));
      console.log('registration success');
      console.log(hash);

      params.res.status(201).send(hash);
    })
    .catch(async (error) => {
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

//--- get citizen database identity
app.get('/citizen/id/', async (req, res) => {
  try {
    const db = await orbitdb.kvstore(citizenAddress, { overwrite: false });
    const identity = db.identity;
    res.status(200).send(identity.toJSON());
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//--- get all userData
app.get('/citizen/', async (req, res) => {
  try {
    const db = await orbitdb.kvstore(citizenAddress, { overwrite: false });
    await db.load();

    const value = db.all;
    db.close();
    res.status(200).send(value);
  } catch (error) {
    console.log('error');
    console.log(error);
    res.status(500).send(error);
  }
});

//--- get specified userData
app.get('/citizen/:uid/', async (req, res) => {
  const uid = req.params.uid;

  try {
    const db = await orbitdb.kvstore(citizenAddress, { overwrite: false });
    await db.load();

    var value = db.get(uid);
    db.close();
    if (value === undefined) {
      res.status(204).send('no citizen found for given uid');
    }
    res.status(200).send(value);
  } catch (error) {
    console.log('error');
    console.log(error);
    res.status(500).send(error);
  }
});

//--- put specified user data
app.post('/citizen/', async (req, res) => {
  console.log(req.body);
  const uid = req.body.uid;
  const name = req.body.name;
  const phash = req.body.hash;

  console.log('uid')
  console.log(uid)
  console.log(name)
  if (uid == undefined || name == undefined) {
    return res.status(500).send("error");
  }

  try {
    const db = await orbitdb.kvstore(citizenAddress, { overwrite: false });
    await db.load();

    const hash = await db.put(uid, {
      name: name,
      hash: phash
    });
    console.log(hash);

    db.close();
    res.status(201).send(hash);
  } catch (error) {
    console.log('error');
    console.log(error);
    res.status(500).send(error);
  }
});

//------------------------------------------------------------
//--- Topic
//------------------------------------------------------------

//--- get all topic
app.get('/topic/', async (req, res) => {
  try {
    dbTopic = await orbitdb.kvstore(topicAddress, { overwrite: false });
    await dbTopic.load();

    const value = dbTopic.all;
    res.status(200).send(value);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//--- get specified topic
app.get('/topic/:uid/', async (req, res) => {
  const uid = req.params.uid;

  console.log(uid);
  try {
    const db = await orbitdb.kvstore(topicAddress, { overwrite: false });
    await db.load();

    var value = db.get(uid);
    if (value === undefined) {
      res.status(204).send('no tag found for given uid');
    }
    res.status(200).send(value);
  } catch (error) {
    console.log(error);
    params.res.status(500).send(error);
  }
});

const postTopic = async.queue((params, callback) => {
  const uid = params.uid;
  const hash = params.hash;
  const title = params.title;
  let orbitdb;
  initIPFSInstance()
    .then(async (ipfs) => {
      const db = await orbitdb.kvstore(topicAddress, { overwrite: false });
      await db.load();

      const rc = await db.put(uid, {
        hash: hash,
        title: title,
      });
      console.log(rc);

      params.res.status(201).send(rc);
    })
    .catch(async (error) => {
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
app.get('/info/:hash/', async (req, res) => {
  const hash = req.params.hash;

  try {
    console.log(hash);
    const db = await orbitdb.log(infoAddress);
    await db.load();

    var value = db.get(hash);
    if (value === undefined) {
      params.res.status(204).send('no vote info found for given hash');
    }
    params.res.status(200).send(value.payload.value);
  } catch (error) {
    console.log(error);
    params.res.status(500).send(error);
  }
});

//--- put specified user data
app.post('/info/', async (req, res) => {
  const info = req.body.info;

  try {
    const dbInfo = await orbitdb.log(infoAddress);
    await dbInfo.load();

    dbTopic = await orbitdb.kvstore(topicAddress, { overwrite: false });
    await dbTopic.load();

    // add Info
    let hash = await dbInfo.add(JSON.stringify(info));
    console.log(hash);

    // check there is a tag
    var tags = dbTopic.all;
    for (var uid in tags) {
      console.log(uid);
      if (tags[uid].title === info.title) {
        if (tags[uid].hash === hash) {
          res.status(204).send('vote info already saved');
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
    const rc = await dbTopic.put(info.uid, {
      hash: hash,
      title: info.title,
    });
    console.log(rc);

    res.status(201).send(hash);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//------------------------------------------------------------
//--- log some data
//------------------------------------------------------------

//--- get log database identity
app.get('/log/id/', async (req, res) => {
  try {
    const db = await orbitdb.log(logAddress);
    const identity = db.identity;
    res.status(200).send(identity.toJSON());
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});


//--- get all log
app.get('/log/', async (req, res) => {
  try {
    const db = await orbitdb.log(logAddress);
    await db.load();
    const value = db.iterator({ limit: -1 })
    .collect()
    .map((e) => e.payload.value)

    res.status(200).send(value);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//--- get some data
app.get('/log/:hash/', async (req, res) => {
  const hash = req.params.hash;

  try {
    console.log(hash);
    const db = await orbitdb.log(logAddress);
    await db.load();

    var value = db.get(hash);
    if (value === undefined) {
      res.status(204).send('no vote info found for given hash');
    }
    res.status(200).send(value.payload.value);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});


//--- Post some data
app.post('/log/', async (req, res) => {
  const body = req.body;

  console.log('body')
  console.log(body)
  if (body == undefined) {
    return res.status(500).send("error");
  }

  try {
    const db = await orbitdb.log(logAddress);
    await db.load();

    // add body
    let rhash = await db.add(body);
    console.log(rhash);

    db.close();
    res.status(201).send(rhash);
  } catch (error) {
    console.log('error');
    console.log(error);
    res.status(500).send(error);
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
