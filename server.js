
const express = require('express');
const path = require('path');
const json2csv = require('json2csv').parse;
const utils = require('./utils');


const PORT = 8990;
const app = express();

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/get-emag-scrapped-images', async (req,res) => {
    try{
        const link = req.query.category;

        if(link){
            const images = await utils.getProductImages(link); 

            let imagesHTML = ``;

            images.forEach(img => {
                imagesHTML=imagesHTML+`<img src=${img} height='300px' width'300px'/><br>`
            })
            res.send(imagesHTML);
        }
        else{
            res.send('Could not scrape data for this category or category is empty');
        }
    }catch(error){
        console.log(error);
        res.sendStatus(500).send(error);
    }
})

app.get('/get-emag-scrapped-data', async (req,res) => {
        try{
            const link = req.query.category;

            if(link){
                const pricesArray = await utils.getProductPrice(link); 
                
                const ARRAY_KEYS = utils.ARRAY_KEYS;
                const opts = {ARRAY_KEYS};
                
                const csv = json2csv(pricesArray, opts);
        
                res.header('Content-Type', 'text/csv');
                res.attachment('emag-scraped-category'+new Date().toLocaleTimeString()+'.csv');
                return res.send(csv);
            }
            else{
                res.send('Could not scrape data for this category or category is empty');
            }
        }catch(error){
            res.sendStatus(500);
        }
        
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})