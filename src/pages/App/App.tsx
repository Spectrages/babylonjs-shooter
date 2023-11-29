import BabylonScene from "../../BabylonScene/BabylonScene";
import styles from "./App.module.scss";

const App = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <BabylonScene />
      </div>
    </div>
  );
};

export default App;
