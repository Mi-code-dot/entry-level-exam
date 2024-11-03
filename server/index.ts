import express from 'express';
import bodyParser = require('body-parser');
import { tempData } from './temp-data';
import { serverAPIPort, APIPath } from '@fed-exam/config';

console.log('starting server', { serverAPIPort, APIPath });
const app = express();

const PAGE_SIZE = 20;
app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.get(APIPath, (req, res) => {
  const page: number = parseInt(req.query.page as string) || 1;
  const search = (req.query.search as string || '').toLowerCase();
  const afterDate = req.query.after ? new Date(req.query.after as string) : null;
  const beforeDate = req.query.before ? new Date(req.query.before as string) : null;
  const emailFilter = (req.query.from as string || '').toLowerCase();

  let filteredData = tempData;

  // Filter by search text
  if (search) {
    filteredData = filteredData.filter(ticket =>
      ticket.title.toLowerCase().includes(search) ||
      ticket.content.toLowerCase().includes(search)
    );
  }

  // Filter by after date
  if (afterDate) {
    filteredData = filteredData.filter(ticket => new Date(ticket.creationTime) > afterDate);
  }

  // Filter by before date
  if (beforeDate) {
    filteredData = filteredData.filter(ticket => new Date(ticket.creationTime) < beforeDate);
  }

  // Filter by email
  if (emailFilter) {
    filteredData = filteredData.filter(ticket => ticket.userEmail.toLowerCase() === emailFilter);
  }

  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  res.send(paginatedData);
});


app.listen(serverAPIPort);
console.log('server running', serverAPIPort)

