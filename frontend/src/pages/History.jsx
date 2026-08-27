import Navbar from "../components/Navbar";

function History() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-container">
        <section className="title-section">
          <h1>Weather History</h1>

          <p>
            Your previous weather searches will appear here.
          </p>
        </section>

        <div className="history-card">
          <p>No weather searches yet.</p>
        </div>
      </main>
    </div>
  );
}

export default History;