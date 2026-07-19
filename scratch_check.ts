async function main() {
  const url =
    'https://unstop.com/api/public/opportunity/search-result?opportunity=competitions&per_page=5&oppstatus=open&title=SDE hiring challenge software engineer';

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobBot/1.0)',
      },
    });
    const data = await response.json();
    const opportunities = data?.data?.data || [];
    for (const item of opportunities) {
      console.log('--- OPPORTUNITY ---');
      console.log('ID:', item.id);
      console.log('Title:', item.title);
      console.log('SEO URL:', item.seo_url);
    }
  } catch (error) {
    console.error(error);
  }
}
main();
