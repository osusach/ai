import { useState } from "react";
import {
  Anchor,
  AppBar,
  Button,
  Frame,
  MenuList,
  MenuListItem,
  Separator,
  TextInput,
  Toolbar,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";
import Chat from "./Chat";

const Layout = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AppBar>
        <Toolbar style={{ justifyContent: "space-between" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Button
              onClick={() => setOpen(!open)}
              active={open}
              style={{ fontWeight: "bold" }}
            >
              <img
                src="/logo.png"
                alt="react95 logo"
                style={{ height: "20px", marginRight: 4 }}
              />
              Start
            </Button>
            {open && (
              <MenuList
                style={{
                  position: "absolute",
                  left: "0",
                  top: "100%",
                }}
                onClick={() => setOpen(false)}
              >
                <MenuListItem>
                  <span role="img" aria-label="👨‍💻">
                    👨‍💻
                  </span>
                  Profile
                </MenuListItem>
                <MenuListItem>
                  <span role="img" aria-label="📁">
                    📁
                  </span>
                  My account
                </MenuListItem>
                <Separator />
                <MenuListItem disabled>
                  <span role="img" aria-label="🔙">
                    🔙
                  </span>
                  Logout
                </MenuListItem>
              </MenuList>
            )}
          </div>

          <TextInput placeholder="Search..." width={150} />
        </Toolbar>
      </AppBar>
      <Window className="window">
        <WindowHeader className="window-title">
          <span>san_bernardo_gpt.exe</span>
          <Button>
            <span>X</span>
          </Button>
        </WindowHeader>
        <Toolbar>
          <Button variant="menu" size="sm">
            File
          </Button>
          <Button variant="menu" size="sm">
            Edit
          </Button>
          <Button variant="menu" size="sm" disabled>
            Save
          </Button>
        </Toolbar>
        <WindowContent>
          <Chat></Chat>
        </WindowContent>
        <Frame variant="well" className="footer">
          <p>
            Locomotive ya alcanzó el chilito del rene!
            <Anchor style={{marginLeft: "10px"}} href="https://expensive.toys" target="_blank">
              Mas información.
            </Anchor>
          </p>
        </Frame>
      </Window>
    </>
  );
};
export default Layout;
