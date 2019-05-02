const delay = (url, ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  }).then(() => rp(url));
};

const removeCompanyDupes = () => {
  const companies = fs.readFileSync('companies.json');
  const arr = JSON.parse(companies);
  const unique = [...new Set(arr)];
  fs.writeFile('companies.json', JSON.stringify(unique), err => {
    if (err) console.log(err);
  });
};

const getCompanies = () => {
  const urls = [];
  let del = 0;
  for (let i = 0; i < 110; i++) {
    if (i === 0) {
      urls.push(
        delay('https://www.builtinaustin.com/companies?status=all', del),
      );
    } else {
      urls.push(
        delay(
          `https://www.builtinaustin.com/companies?status=all&page=${i}`,
          del,
        ),
      );
    }
    del += 7000;
    console.log(del);
  }
  return Promise.all(urls);
};

const writeCompanies = () => {
  getCompanies()
    .then(htmls => {
      console.log(htmls);
      const companies = [];
      htmls.forEach(html => {
        const companyName = $(
          '.view-companies-landing .views-row .title span',
          html,
        );
        for (let i = 0; i < companyName.length; i++) {
          companies.push(companyName[i].children[0].data);
        }
      });
      fs.writeFile('companies.json', JSON.stringify(companies), err => {
        if (err) console.log(err);
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const checkAllCompaniesScraped = () => {
  const companiesList = JSON.parse(fs.readFileSync('companies.json'));
  const btCompanies = JSON.parse(fs.readFileSync('beforeTransform.json')).map(
    company => company.name,
  );
  return companiesList.filter(company => !btCompanies.includes(company));
};

module.exports = {
  getCompanies,
  writeCompanies,
  checkAllCompaniesScraped,
  removeCompanyDupes,
};
