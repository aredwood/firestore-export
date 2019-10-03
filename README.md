## Usage
```typescript
    import firestoreExport from "firestore-export";
    import {Firestore} from "@google-cloud/firestore";

    const firestore = new Firestore();

    firestoreExport(firestore,"my-collection");
```