// pages/api/facebookPixel.js

import { connectToDatabase } from '../../utils/mongodb';
import FacebookPixel from '../../models/FacebookPixel';
import authenticateToken from './middleware/auth';
import { Cashfree } from "cashfree-pg";

connectToDatabase();

export default async function handler(req, res) {
  // Apply the middleware for token verification
  authenticateToken(req, res, () => handleRequest(req, res));
}


Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

async function handleRequest(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
  
    try {

        let {
            orderId
        } = req.body;

        Cashfree.PGOrderFetchPayments("2023-08-01", orderId).then((response) => {

            res.json(response.data);
        }).catch(error => {
            console.error(error.response.data.message);
        })


    } catch (error) {
        console.log(error);
    }
      break;

    default:
      res.status(405).json({ status: 0, message: 'Method Not Allowed' });
      break;
  }
}
