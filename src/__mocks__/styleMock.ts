const styleMock = new Proxy(
  {},
  {
    get(_target, prop) {
      return prop;
    },
  },
);

export default styleMock;
