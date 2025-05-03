import { useEffect, useState } from "react";
import "./styles/App.css";

const Typewriter = ({ response }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!response || typeof response !== "string") return;
    let i = 0;
    setText(response.charAt(0));

    const interval = setInterval(() => {
      if (i < response.length) {
        setText((prev) => prev + response.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [response]);
  return <p className="response">{text}</p>;
};

const App = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function askGemini(question) {
    setLoading(true);
    setResponse("");

    const API_Key = import.meta.env.VITE_API_KEY_GEMINI;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_Key}`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 512,
          },
        }),
      });

      const data = await res.json();

      if (data.candidates) {
        setResponse(data.candidates[0].content.parts[0].text);
      } else {
        setResponse("Error: No response from Gemini API.");
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
    document.getElementById("big-q").innerHTML = question;
    setQuestion("");
  }

  const clearResponse = (e) => {
    e.preventDefault();
    setResponse("");
    document.getElementById("answer").innerHTML = "";
    document.getElementById("big-q").innerHTML = "";
  };

  const pressEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askGemini(question);
    }
  };

  return (
    <>
      <div className="checkbox-wrap">
        <div className="checkbox-cont">
          <input type="checkbox" id="toggle-dropdown" />
          <div className="label1-cont">
            <label for="toggle-dropdown" id="label1">
              <span className="icon">+</span>
            </label>
          </div>
          <div id="dropdown">dropdown content first</div>
          <div id="dropdown">dropdown content second</div>
          <div id="dropdown">dropdown content third</div>
          <div id="dropdown">dropdown content last</div>
        </div>
      </div>
      <div className="App">
        <div className="main-body">
          <h2 className="header">
            <i>Ask Gemini AI</i>
          </h2>
          <div>
            <p className="response-text-header">
              <strong>Gemini's Response</strong>:
            </p>
          </div>
          <div className="body-text-container">
            <div className="response-container">
              <div className="typewriter" id="answer">
                <Typewriter response={response} />
              </div>
            </div>
            <div className="question-asked-container">
              <p className="question-asked" id="big-q"></p>
            </div>
          </div>
          <br />
          <div className="question-box-container">
            <textarea
              className="question-box"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={pressEnter}
              placeholder="Type your question here..."
              rows="10"
              cols="60"
            />
          </div>
          <div className="button-container">
            <button
              className="ask-button"
              onClick={() => askGemini(question)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Ask Gemini"}
            </button>
            <button className="clear-button" onClick={clearResponse}>
              Clear Response
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
