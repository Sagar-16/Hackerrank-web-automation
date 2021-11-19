//npm install minimist
//npm init -y
//npm install puppeteer
// node Automation.js --url="https://www.hackerrank.com" --config="config.json"

let minimist = require("minimist");
let fs = require("fs");
let puppeteer = require("puppeteer");





let args = minimist(process.argv);
let configKaJson = fs.readFileSync(args.config,'utf8');
let config = JSON.parse(configKaJson);
let userid = config.userid;
let password = config.password;
let mod = config.moderator;


async function run() {
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    let pages = await browser.pages();
    let page = pages[0];
    await page.goto(args.url);

    await page.waitForSelector("a[href='https://www.hackerrank.com/access-account/']");
    await page.click("a[href='https://www.hackerrank.com/access-account/']");

    await page.waitForSelector('a[href="https://www.hackerrank.com/login"]');
    await page.click('a[href="https://www.hackerrank.com/login"]');

    

    await page.waitForSelector('input[name="username"]');
    await page.click('input[name="username"]');
    await page.keyboard.type("sagar.dhampalwar1697@gmail.com");
    
    await page.waitForSelector('input[name="password"]');
    await page.click('input[name="password"]');
    await page.keyboard.type("Shaggy@123");

    await page.waitForSelector('button[data-analytics="LoginPassword"]');
    
    await page.click('button[data-analytics="LoginPassword"]');  

    await page.waitForSelector('a[href="/contests"]')
    await page.click('a[href="/contests"]')

    await page.waitForSelector('a[href="/administration/contests/"]');
    await page.click('a[href="/administration/contests/"]');
    await page.waitForSelector('a[data-attr1="Last"]');
    
    let numPages = await page.$eval('a[data-attr1="Last"]', function (atag) {
        let totPages = parseInt(atag.getAttribute("data-page"));
        return totPages;
    });

    for(let i = 1; i<=numPages; i++){
        await handleAllPagesOfContest(page,browser);
        if(i!= numPages){
            await page.waitForSelector("a[data-attr1='Right']");
            await page.click("a[data-attr1='Right']");
        }
        
    }

    async function handleAllPagesOfContest(page, browser){
        await page.waitForSelector("a.backbone.block-center");
        let curls = await page.$$eval("a.backbone.block-center",function(atags){
            let urls = [];
            for(let i = 0; i<atags.length; i++){
                let url = atags[i].getAttribute("href");
                urls.push(url);
            }
            return urls;
        });
        console.log(curls);
        await page.waitFor(1000);
        for(let i = 0; i<curls.length; i++){
            let newTab = await browser.newPage();
            await saveModInContest(newTab, args.url+curls[i], config.moderator);
            await newTab.close();
            await page.waitFor(1000);
        }

        

        }


        async function saveModInContest(newTab, curl, mod){
            await newTab.goto(curl);
            await newTab.waitFor(3000);
            await newTab.waitForSelector('li[data-tab="moderators"]');
            await newTab.click('li[data-tab="moderators"]');
            for(let i = 0; i<mod.length; i++){
            await newTab.waitForSelector('input#moderator');
            await newTab.click('input#moderator');
            await newTab.keyboard.type(mod[i],{
                delay:30
            });
            await newTab.waitFor(1100);
            await newTab.click('button.moderator-save');
            await newTab.waitFor(500);
            }
        }


}
run()






