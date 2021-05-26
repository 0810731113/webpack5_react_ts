import { atom, selector } from "recoil";

const TestState = atom({
  key: "testState", // unique ID (with respect to other atoms/selectors)
  default: {
    user: {
      counter: 0,
    },
  }, // default value (aka initial value)
});

export const counterState = selector({
  key: "counterState",
  get({ get }) {
    return get(TestState).user.counter;
  },
});

export default TestState;
