const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require('axios');

const ARRAY_KEYS = ['title','price','full_title'];

async function getProductImages(link){
    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    await page.goto(link, {waitUntil : 'networkidle0'});

    await autoScroll(page);

    let data = await page.evaluate(async () => {
        let images = document.querySelectorAll('.thumbnail img');
        const imagesArray = Array.from(images);
        return imagesArray.map(e => e.src);
    })
    return data;
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function getProductPrice(link){
    const response = await axios.get(link);
    const text = response.data;

    const $ = cheerio.load(text);

    let products = [];
    $('.card-section-wrapper').get().map((elem) => {
        const full_title = $(elem).find('.product-title').text().trim();
        const title = full_title.substr(0,50);

        const price = $(elem).find('.product-new-price');
        price.find('sup').remove();

        products.push({title, price : price.text(), full_title})
    });

    return products;
}

exports.ARRAY_KEYS = ARRAY_KEYS;
exports.getProductPrice = getProductPrice;
exports.getProductImages = getProductImages;