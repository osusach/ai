import { useState } from "react";
import { Button, Frame, ScrollView, TextInput } from "react95";

const Chat = () => {
  const [state, setState] = useState({
    value: "",
  });
  const [chat, setChat] = useState({
    value: ["Hola dame chilito"],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ value: e.target.value });
  };

  const send = () => {
    setChat({ value: [...chat.value, state.value] });
    setState({ value: "" });
  };

  return (
    <>
      <ScrollView
        style={{
          background: "white",
          height: 200,
        }}
      >
        <div
          style={{
            height: 400,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {chat.value.map((text, index) => (
            <p key={index}> &gt; {text}</p>
          ))}
        </div>
      </ScrollView>
      <div style={{ display: "flex" }}>
        <TextInput
          value={state.value}
          placeholder="Type here..."
          onChange={handleChange}
          fullWidth
        />
        <Button onClick={send} style={{ marginLeft: 4 }}>
          Send
        </Button>
      </div>
    </>
  );
};
export default Chat;
