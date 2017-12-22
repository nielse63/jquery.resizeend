const timeout = 5000;

describe(
  '/ (Home Page)',
  () => {
    let page;
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage();
      await page.goto('http://localhost:3000');
    }, timeout);

    describe('sanity', () => {
      it('page title', async () => {
        const $title = await page.$('.site-title');
        const text = await page.evaluate(title => {
          return title.textContent;
        }, $title);
        await $title.dispose();
        expect(text).toContain('jQuery resizeend event');
      });

      it('tracking load event', async () => {
        const $title = await page.$('.window');
        const text = await page.evaluate(title => {
          return title.textContent;
        }, $title);

        // Dispose of handler and run test
        await $title.dispose();
        expect(text).toContain('load fired');
      });
    });

    describe('happy path', () => {
      it('tracking resizeend event', async () => {
        const $title = await page.$('.window');

        // Resize window
        await page.setViewport({
          height: 600,
          width: 1100,
        });

        // Get text
        const text = await page.evaluate(title => {
          return title.textContent;
        }, $title);

        // Dispose of handler and run test
        await $title.dispose();
        expect(text).toContain('resizeend fired');
      });
    });
  },
  timeout,
);
