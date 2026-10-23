export function createContextMenuSetup({ removeAll, create, items }) {
  let setupInFlight = null;

  return function setupContextMenus() {
    if (setupInFlight) return setupInFlight;

    let runSetup;
    const setup = new Promise((resolve, reject) => {
      runSetup = async () => {
        try {
          await removeAll();
          for (const item of items) await create(item);
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          if (setupInFlight === setup) setupInFlight = null;
        }
      };
    });

    setupInFlight = setup;
    void runSetup();
    return setup;
  };
}
