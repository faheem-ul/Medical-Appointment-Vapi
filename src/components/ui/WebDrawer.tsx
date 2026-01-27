"use client";

import { MenuCloseIcon, MenuIcon } from "./Icons";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "./ShadCnDrawer";


interface WebDrawerProps {
  children?: React.ReactNode;
}

const WebDrawer = ({ children }: WebDrawerProps) => {
  return (
    <>
      {/* Drawer Trigger Button */}
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <button className="p-2" aria-label="Open menu">
            <MenuIcon />
          </button>
        </DrawerTrigger>

        {/* Drawer Content */}
        <DrawerContent className="h-full w-full max-w-none rounded-none border-none">
          <div
            className="relative h-full w-full flex flex-col"
            
          >
            {/* Close Icon - Top Right */}
            <div className="absolute top-[57px] right-[34px] z-10">
              <DrawerClose asChild>
                <button className="bg-transparent p-2" aria-label="Close menu">
                  <MenuCloseIcon />
                </button>
              </DrawerClose>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col pt-16 pb-8 px-6">
              {children}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default WebDrawer;
