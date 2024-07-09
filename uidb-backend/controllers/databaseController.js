const { createMySQLConnection } = require("../services/mysqlService");
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getConnections = async (req, res) => {
  try {
    const connections = await User.find({ _id: req.user.id });
    const {sqlConnectionDetails} = connections[0]
    // console.log(sqlConnectionDetails);
    res.status(200).json(sqlConnectionDetails);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Error fetching connections' });
  }
};

const connectDatabase = async (req, res) => {
  const { host, user, password, database } = req.body;

  try {

    const existingConnection = await User.findOne({
      _id: req.user.id,
      database: database
    });

    if (existingConnection) {
      return res.status(400).json({ error: 'A connection with this database already exists for your account' });
    }

    // Test the connection
    const connection = await createMySQLConnection({ host, user, password, database });
    await connection.end();
    const sqlSalt = await bcrypt.genSalt(10);
    const hashedSqlPassword = await bcrypt.hash(password, sqlSalt);
    // Save the connection details to your database
    const newConnection = new User({
      _id: req.user.id,
      host, 
      user,
      hashedSqlPassword, 
      database,
    });
    await newConnection.save();

    res.status(200).json({ message: 'Connection created successfully' });
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ error: 'Error creating connection' });
  }
};

module.exports = {
  getConnections,
  connectDatabase,
};