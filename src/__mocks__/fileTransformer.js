// Simple transformer that returns a string for any asset file
export default {
  process() {
    return {code: "export default 'test-file-stub'"};
  }
};