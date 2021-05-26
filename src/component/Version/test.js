// import React from "react";
// import pretty from "pretty";
// import { render, screen } from '@testing-library/react';
// import { act } from "react-dom/test-utils";
// import { render as renderHtml, unmountComponentAtNode } from "react-dom";
// import VersionInfoList from "./VersionInfoList";

// let container;

// beforeEach(() => {
//   container = document.createElement('div');
//   document.body.appendChild(container);
// })

// afterEach(() => {
//   unmountComponentAtNode(container);
//   container.remove();
//   container = null;
// })

// it("test api", () => {

//   //const data = [];

//   // jest.spyOn(global, "loader").mockImplementation(() =>
//   //   Promise.resolve(data)
//   // )

//   act(() => {
//     renderHtml(<VersionInfoList versionIds={[]} />, container);
//   })

//   expect(
//     pretty(container.innerHTML)
//   ).toMatchSnapshot();

//   //global.fetch.mockRestore();
// })
