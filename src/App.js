import { useEffect, useRef, useState } from "react";
import { FaLinkedinIn } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  VStack,
  Stack,
  Link,
  Text
} from "@chakra-ui/react";
import Message from "./Components/Message";
import { app } from "./firebase";
import {
  onAuthStateChanged,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const logoutHandler = () => signOut(auth);

function App() {
  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const divForScroll = useRef(null);

  const submitHandler = async e => {
    e.preventDefault();

    try {
      setMessage("");

      await addDoc(collection(db, "Messages"), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),
      });

      divForScroll.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "Messages"), orderBy("createdAt", "asc"));

    const unsubscribe = onAuthStateChanged(auth, data => {
      setUser(data);
    });

    const unsubscribeForMessage = onSnapshot(q, snap => {
      setMessages(
        snap.docs.map(item => {
          const id = item.id;
          return { id, ...item.data() };
        })
      );
    });

    return () => {
      unsubscribe();
      unsubscribeForMessage();
    };
  }, []);

  return (
    <Box bg={"#0F2C59"} >
      {user ? (
        <Container h={"100vh"} bg={"white"}>
          <VStack h="full" paddingY={"4"}>
            <Button onClick={logoutHandler} colorScheme={"red"} w={"full"}>
              Logout
            </Button>

            <VStack
              h="full"
              w={"full"}
              overflowY="auto"
              css={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {messages.map(item => (
                <Message
                  key={item.id}
                  user={item.uid === user.uid ? "me" : "other"}
                  text={item.text}
                  uri={item.uri}
                />
              ))}

              <div ref={divForScroll}></div>
            </VStack>

            <form onSubmit={submitHandler} style={{ width: "100%" }}>
              <HStack>
                <Input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter a Message..."
                />
                <Button colorScheme={"purple"} type="submit">
                  Send
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack bg="#00A9FF"  justifyContent={"center"}  h="100vh">
          <Stack direction="row" spacing={4} mb={"10"}>
            <Link href="mailto:coderashukr321@gmail.com" target="_blank">
              <Button colorScheme="teal" variant="solid">
                Email Us
              </Button>
            </Link>

            <Link
              href="https://www.linkedin.com/in/ashutosh-kumar-7ba1a6211/"
              target="_blank"
            >
              <Button colorScheme="blue" variant="solid">
                <FaLinkedinIn />
              </Button>
            </Link>
            <Link
              href="https://instagram.com/ashukr321?igshid=OGQ5ZDc2ODk2ZA=="
              target="_blank"
            >
              <Button
                color={"white"}
                variant="solid"
                style={{ backgroundColor: "#2B3499" }}
              >
                <FaInstagram />
              </Button>
            </Link>
          </Stack>
          <Button onClick={loginHandler} colorScheme={"purple"}>
            Sign In With Google
          </Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
