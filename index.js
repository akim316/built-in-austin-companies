const rp = require('request-promise');
const $ = require('cheerio');
const url = 'https://www.builtinaustin.com/companies?status=all';

const getCompanies = () => {
    const urls = [];
    for (let i = 0; i < 110; i++) {
        if (i === 0) {
            urls.push(rp('https://www.builtinaustin.com/companies?status=all'));
        } else {
            urls.push(rp(`https://www.builtinaustin.com/companies?status=all&page=${i}`));
        }
    }
    console.log(urls);
    return Promise.all(urls);
}
console.log(getCompanies());
// getCompanies().then(html => {
//     const companyName = $('.view-companies-landing .views-row .title span', html);
//     const companies = [];
//     html.forEach(obj => {
//         companies.push(obj.children[0].data);
//     });
//     console.log(companies);
// }).catch(err => {
//     console.log(err);
// });