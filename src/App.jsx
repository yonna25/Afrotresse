export default function App() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    console.log("LOG APP : Composant App monté");
    console.log("LOG APP : LocalStorage Name ->", localStorage.getItem('afrotresse_user_name'));
    
    if (!localStorage.getItem('afrotresse_user_name')) {
      setShowWelcome(true);
    }
  }, []);

  // Capture d'erreur rudimentaire
  if (typeof Results === 'undefined') {
    return <div style={{background: 'blue', color: 'white', p: 20}}>Erreur : Le composant Results n'est pas importé correctement.</div>
  }

  return (
    <BrowserRouter>
      {showWelcome && <WelcomePopup onDone={() => setShowWelcome(false)} />}
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
