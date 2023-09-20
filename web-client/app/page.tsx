"use client";
import { ThemeWrapper } from "./_helpers/ThemeWrapper";
import JotaiWrapper from "./_helpers/JotaiWrapper";
import LeftContainer from "./_components/LeftContainer";
import RightContainer from "./_components/RightContainer";
import { ModalWrapper } from "./_helpers/ModalWrapper";
import { useEffect } from "react";

import {
  setup,
  plugins,
  activationPoints,
} from "../node_modules/pluggable-electron/dist/execution.es";

const Page: React.FC = () => {
  useEffect(() => {
    async function setupPE() {
      // Enable activation point management
      setup({
        //@ts-ignore
        importer: (plugin) =>
          import(/* webpackIgnore: true */ plugin).catch((err) => {
            console.log(err);
          }),
      });

      // Register all active plugins with their activation points
      await plugins.registerActive();
    }
    setupPE();

    activationPoints.trigger("init");
  }, []);
  return (
    <>
      <JotaiWrapper>
        <ThemeWrapper>
          <ModalWrapper>
            <div className="flex">
              <LeftContainer />
              <RightContainer />
            </div>
          </ModalWrapper>
        </ThemeWrapper>
      </JotaiWrapper>
    </>
  );
};

export default Page;
