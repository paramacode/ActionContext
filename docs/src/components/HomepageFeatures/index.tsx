import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Built on IAS',
    description: (
      <>
        Powered by Roblox's modern <strong>Input Action System</strong>,
        using real <code>InputContext</code>, <code>InputAction</code>, and <code>InputBinding</code> instances.
        No ContextActionService. No UserInputService spaghetti.
      </>
    ),
  },
  {
    title: 'Context-Driven',
    description: (
      <>
        Group actions by game state and switch
        between them with a single call. Supports exclusive activation so
        only one context responds at a time.
      </>
    ),
  },
  {
    title: 'Runtime Rebinding',
    description: (
      <>
        Change keybinds at runtime without destroying actions or disconnecting
        events. Query current bindings, build settings UIs, and serialize
        player profiles, all from one API.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
