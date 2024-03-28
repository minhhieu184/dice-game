#!/bin/bash

MONGODB1=mongo1
MONGODB2=mongo2
MONGODB3=mongo3

echo "**********************************************" ${MONGODB1}
echo "Waiting for startup.."
sleep 10
echo "done"

echo SETUP.sh time now: `date +"%T" `
mongosh --host ${MONGODB1}:27017 -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} <<EOF
var cfg = {
  "_id": "${MONGO_REPLICA_SET_NAME}",
  "protocolVersion": 1,
  "version": 1,
  "members": [
    {
      "_id": 0,
      "host": "${MONGODB1}:27017",
      "priority": 2
    },
    {
      "_id": 1,
      "host": "${MONGODB2}:27017",
      "priority": 0
    },
    {
      "_id": 2,
      "host": "${MONGODB3}:27017",
      "priority": 0,
    }
  ]
};
rs.initiate(cfg, { force: true });
rs.setReadPref("primaryPreferred");
db.getMongo().setReadPref('primary');
rs.status();
EOF
