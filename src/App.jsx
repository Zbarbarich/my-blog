import Header from './components/Header/Header';
import BlogList from './components/BlogList/BlogList';
import { posts } from './data/posts';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <BlogList posts={posts} />
      </main>
    </div>
  ); 
}

export default App;
