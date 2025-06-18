import React, { PropsWithChildren } from "react";
import { WebSocketProvider } from "./constants/websocket.contex";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
}
