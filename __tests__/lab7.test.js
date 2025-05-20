describe("Basic user flow for Website", () => {
  beforeAll(async () => {
    await page.goto("https://cse110-sp25.github.io/CSE110-Shop/");
    await page.waitForFunction(() => {
      const items = document.querySelectorAll("product-item");
      return (
        items.length === 20 &&
        [...items].every(
          (it) => it.shadowRoot && it.shadowRoot.querySelector("button")
        )
      );
    });
  });

  it("Initial Home Page – 20 <product-item> elements are present", async () => {
    const numProducts = await page.$$eval(
      "product-item",
      (prodItems) => prodItems.length
    );
    expect(numProducts).toBe(20);
  });

  it("All <product-item> elements are populated", async () => {
    const allPopulated = await page.$$eval("product-item", (items) =>
      items.every((item) => {
        const data = item.data;
        return data && data.title && data.price && data.image;
      })
    );
    expect(allPopulated).toBe(true);
  }, 10_000);

  it('Clicking the first Add‑to‑Cart button changes its text to "Remove from Cart"', async () => {
    const btnText = await page.evaluate(() => {
      const item = document.querySelector("product-item");
      const btn = item.shadowRoot.querySelector("button");
      btn.click();
      return btn.innerText;
    });
    expect(btnText).toBe("Remove from Cart");
  });

  it("Adding every item updates cart count to 20", async () => {
    await page.$$eval("product-item", (items) => {
      items.forEach((item) => {
        const btn = item.shadowRoot.querySelector("button");
        if (btn.innerText === "Add to Cart") btn.click();
      });
    });
    const cartCount = await page.$eval("#cart-count", (el) => el.innerText);
    expect(cartCount).toBe("20");
  }, 10_000);

  it("Cart state persists after reload (all buttons say Remove & cart‑count = 20)", async () => {
    await page.reload();
    // Wait until all product‑items & their buttons are ready again
    await page.waitForFunction(() => {
      const items = document.querySelectorAll("product-item");
      return (
        items.length === 20 &&
        [...items].every(
          (it) => it.shadowRoot && it.shadowRoot.querySelector("button")
        )
      );
    });

    const everyRemoved = await page.$$eval("product-item", (items) =>
      items.every(
        (item) =>
          item.shadowRoot.querySelector("button").innerText ===
          "Remove from Cart"
      )
    );
    expect(everyRemoved).toBe(true);

    const cartCount = await page.$eval("#cart-count", (el) => el.innerText);
    expect(cartCount).toBe("20");
  }, 10_000);

  it('localStorage "cart" entry is correct after adding all items', async () => {
    const cartArray = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cart"))
    );
    const numericCart = cartArray.map(Number);
    expect(numericCart).toEqual([...Array(20)].map((_, i) => i + 1));
  });

  it("Removing every item sets cart‑count to 0", async () => {
    await page.$$eval("product-item", (items) => {
      items.forEach((item) => {
        const btn = item.shadowRoot.querySelector("button");
        if (btn.innerText === "Remove from Cart") btn.click();
      });
    });
    const cartCount = await page.$eval("#cart-count", (el) => el.innerText);
    expect(cartCount).toBe("0");
  }, 10_000);

  it("After reload, buttons show Add to Cart & cart‑count is 0", async () => {
    await page.reload();
    await page.waitForFunction(() => {
      const items = document.querySelectorAll("product-item");
      return (
        items.length === 20 &&
        [...items].every(
          (it) => it.shadowRoot && it.shadowRoot.querySelector("button")
        )
      );
    });

    const allAdd = await page.$$eval("product-item", (items) =>
      items.every(
        (item) =>
          item.shadowRoot.querySelector("button").innerText === "Add to Cart"
      )
    );
    expect(allAdd).toBe(true);

    const cartCount = await page.$eval("#cart-count", (el) => el.innerText);
    expect(cartCount).toBe("0");
  }, 10_000);

  it('localStorage "cart" entry is [] after removing all items', async () => {
    const cartArray = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cart"))
    );
    expect(Array.isArray(cartArray) && cartArray.length === 0).toBe(true);
  });
});
