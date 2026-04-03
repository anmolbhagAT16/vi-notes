import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect} from "react";


function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState<string>("");
  const [keyCount, setKeyCount] = useState<number>(0);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [isPasted, setIsPasted] = useState<boolean>(false);
  const [pasteCount, setPasteCount] = useState<number>(0);

  const [darkMode, setDarkMode] = useState<boolean>(true);

  const hasStarted = useRef<boolean>(false);

  // --- Handlers ---

  useEffect(() => {
  textareaRef.current?.focus();
}, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!hasStarted.current) {
      setStartTime(Date.now());
      hasStarted.current = true;
    }
    setKeyCount((prev) => prev + 1);
    if (e.key === "Backspace") setBackspaceCount((prev) => prev + 1);
  };

  const handlePaste = () => {
    setIsPasted(true);
    setPasteCount((prev) => prev + 1);
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const clearText = () => {
    setText("");
    setKeyCount(0);
    setBackspaceCount(0);
    setPasteCount(0);
    setIsPasted(false);
    setStartTime(null);
    hasStarted.current = false;
  };

  const copyText = () => navigator.clipboard.writeText(text).then(() => alert("Text copied!"));

  const pasteText = () => {
    navigator.clipboard.readText().then((clipText) => {
      setText((prev) => prev + clipText);
      setIsPasted(true);
      setPasteCount((prev) => prev + 1);
    }).catch(() => alert("Unable to access clipboard."));
  };

  // --- Utility Functions ---
  const getTimeElapsed = () => (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0);

  const calculateScore = () => {
    let score = 100;
    const time = getTimeElapsed();

    if (pasteCount > 0) score -= 40;
    if (backspaceCount === 0 && text.length > 35) score -= 15;

    const speed = time > 0 ? text.length / (time / 60) : 0;
    if (speed > 200) score -= 15;

    if (keyCount < text.length) score -= 10;
    if (time < 5 && text.length > 50) score -= 10;

    if (score < 0) score = 0;
    return score;
  };

  const score = calculateScore();

  const getMessage = () => {
    if (score > 80) return " Likely Human Written";
    if (score > 50) return " Some Suspicious Activity";
    return " Likely AI / Pasted Content";
  };

  // --- Styles ---
  const containerStyle = {
    padding: "20px",
    fontFamily: "Arial",
    backgroundColor: darkMode ? "#121212" : "#ffffff",
    color: darkMode ? "#ffffff" : "#000000",
    minHeight: "100vh",
  };

  const headerColor = darkMode ? "#90caf9" : "#1a237e";
  const textareaStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
    color: darkMode ? "#ffffff" : "#000000",
  };

  const buttonStyle = {
    padding: "8px 15px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      {/* Top bar with Dark/Light Mode */}
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "15px" }}>
        <button
          onClick={toggleTheme}
          style={{ ...buttonStyle, backgroundColor: darkMode ? "#bb86fc" : "#6200ee", color: "#fff" }}
        >
          {darkMode ? " Light Mode" : " Dark Mode"}
        </button>
      </div>

      {/* Header */}
      <h1 style={{ color: headerColor }}>Vi-Notes</h1>

      {/* Buttons above textarea */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div>
          <button
            onClick={copyText}
            style={{ ...buttonStyle, backgroundColor: "#4caf50", color: "#fff", marginRight: "10px" }}
          >
             Copy
          </button>
          <button
            onClick={pasteText}
            style={{ ...buttonStyle, backgroundColor: "#2196f3", color: "#fff" }}
          >
             Paste
          </button>
        </div>
        <div>
          <button
            onClick={clearText}
            style={{ ...buttonStyle, backgroundColor: "#f44336", color: "#fff" }}
          >
             Clear
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        rows={15}
        placeholder="Start typing your notes..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={textareaStyle}
      />

      {/* Stats & Score */}
      <div style={{ marginTop: "15px" }}>
        <p><strong>Characters:</strong> {text.length}</p>
        <p><strong>Words:</strong> {text.trim() === "" ? 0 : text.trim().split(/\s+/).length}</p>
        <p><strong>Total Keys Pressed:</strong> {keyCount}</p>
        <p><strong>Backspaces:</strong> {backspaceCount}</p>
        <p><strong>Paste Count:</strong> {pasteCount}</p>
        <p><strong>Time (seconds):</strong> {getTimeElapsed()}</p>

        {isPasted && (
          <p style={{ color: "red", fontWeight: "bold" }}>
             Pasted content detected!
          </p>
        )}

        <hr />

        <h2 style={{ color: headerColor }}>Authenticity Score: {score}%</h2>
        <p><strong>{getMessage()}</strong></p>
      </div>
    </div>
  );
}

export default App;