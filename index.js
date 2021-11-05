const PORT = process.env.PORT || 8000

const express = require('express');
const app = express();

const axios = require('axios');
const cheerio = require('cheerio');

//newspapers to scrape
const newspapers = [{
        name: 'thetimes',
        address: 'https://www.thetimes.co.uk/environment/climate-change',
        base: ''
    },
    {
        name: 'guardian',
        address: 'https://www.theguardian.com/environment/climate-crisis',
        base: ''
    },
    {
        name: 'telegraph',
        address: 'https://www.telegraph.co.uk/climate-change',
        base: 'https://www.telegraph.co.uk'
    }

]
const articles = []

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)

            //finds any 'a' tags that contain the word 'climate' 
            $('a:contains("climate")', html).each(function () {
                const title = $(this).text() //saves the title for each article
                const url = $(this).attr('href') //gets the href url for each article

                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })
            })

        }).catch((err) => console.log(err))
})

//SCRAPE OUR WEBPAGES

app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change News API');
});



app.get('/news', (req, res) => {
    res.json(articles) //displays the article arr in the browser using res.json
})

app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId;

    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

    axios.get(newspaperAddress)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)

            const specificArticles = []
            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specificArticles)
        }).catch((err) => console.log(err))
})

app.listen(PORT, () => {
    console.log('Running on port 3000');
});