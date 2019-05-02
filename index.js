const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');
let failed = [];

const transformCompanyName = company => {
  return company
    .toLowerCase()
    .replace(/™/g, 'tm')
    .replace(
      /the\b|\bin\b|\bup|\bon\b|\bfor\b|,|-|\bthe\b|\bto\b|\bat\b|\bof\b|:|\(|\)/g,
      '',
    )
    .trim()
    .replace(/\s+|\//g, '-');
};

const delayScrape = (companyName, ms) => {
  const usedName = companyName;
  console.log(usedName);
  const companyObj = {
    name: null,
    description: null,
    location: null,
    exactLocation: null,
    yearFound: null,
    website: null,
    industry: null,
    localEmployees: null,
    totalEmployees: null,
    techStack: [],
    benefits: [],
  };
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  })
    .then(() => rp(`https://www.builtinaustin.com/company/${usedName}`))
    .then(companyInfo => {
      companyObj.name = companyName;
      const location = $(
        '.views-element-container .item-locality',
        companyInfo,
      );
      companyObj.location = (location.length && location.text().trim()) || null;

      const yearFound = $(
        '.views-element-container .item-founded time',
        companyInfo,
      );
      companyObj.yearFound = (yearFound.length && yearFound.text()) || null;

      const website = $(
        '.views-element-container .item-website a',
        companyInfo,
      );
      companyObj.website =
        (website.length &&
          website.attr('href').split('?utm_source=BuiltinAustin')[0]) ||
        null;

      const industry = $(
        '.container-company-info .col-industry .item',
        companyInfo,
      );
      companyObj.industry = (industry.length && industry.text()) || null;

      const localEmployees = $(
        '.container-company-info .field_local_employees .item',
        companyInfo,
      );
      companyObj.localEmployees =
        (localEmployees.length && localEmployees.text()) || null;

      const totalEmployees = $(
        '.container-company-info .field_total_employees .item',
        companyInfo,
      );
      companyObj.totalEmployees =
        (totalEmployees.length && totalEmployees.text()) || null;

      const description = $(
        '.company-overview-content .col-2 .description',
        companyInfo,
      );
      companyObj.description =
        (description.length && description.text()) || null;

      const exactLocation = $('.gmap_location_widget_description', companyInfo);
      companyObj.exactLocation =
        (exactLocation.length && exactLocation.text()) || null;

      const techStack = $(
        '.block-bix-companies-our-full-stack-block [class*=icon-engineering] .full-stack-item',
        companyInfo,
      );
      techStack.length &&
        techStack.each((index, element) => {
          companyObj.techStack.push($(element).text());
        });

      return rp(`https://www.builtinaustin.com/company/${usedName}/benefits`);
    })
    .then(benefitsInfo => {
      const perks = [];
      const perksList = $('.field_perks_list .section', benefitsInfo).each(
        (index, element) => {
          $(element)
            .find('.perks .perk-item .perk-title span')
            .each((i, e) => {
              perks.push(e.children[0].data);
            });
        },
      );
      companyObj.benefits = perks;
      // if (!companyObj) failed.push(companyName);
      if (companyObj) {
        // const failedFile = fs.readFileSync('failed.json');
        // const arr = JSON.parse(failedFile);
        // arr.push(companyName);
        // fs.writeFileSync('failed.json', JSON.stringify(arr));
        // const failedFile = fs.readFileSync('failed.json');
        // const failedArr = JSON.parse(failedFile);
        // const newFailedArr = failedArr.filter(value => value !== companyName);
        // fs.writeFileSync('failed.json', JSON.stringify(newFailedArr));

        const btFile = fs.readFileSync('beforeTransform.json');
        const btArr = JSON.parse(btFile);
        btArr.push(companyObj);
        fs.writeFileSync('beforeTransform.json', JSON.stringify(btArr));
      }

      return companyObj;
    })
    .catch(err => {
      console.log(err);
      // const failedFile = fs.readFileSync('failed.json');
      // const arr = JSON.parse(failedFile);
      // arr.push(companyName);
      // fs.writeFileSync('failed.json', JSON.stringify(arr));
      // failed.push(companyName);
    });
};

const main = () => {
  const companies = JSON.parse(fs.readFileSync('failed.json'));
  const promises = [];
  let delay = 0;
  companies.forEach(company => {
    promises.push(delayScrape(company, delay));
    delay += 1000;
  });
  Promise.all(promises).then(resp => resp);
};
