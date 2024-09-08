import { Heading, TextField } from "@radix-ui/themes";
import { useState } from "react";

function PasteArea({ onPaste }: { onPaste: (dt: DataTransfer) => void }) {
  return (
    <TextField.Root
      onPaste={(evt) => {
        onPaste(evt.clipboardData);
      }}
      value=""
    />
  );
}

export function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Heading size="4">Paste</Heading>
      <PasteArea
        onPaste={(data) => {
          console.log("paste", data);
        }}
      />
    </>
  );
}
