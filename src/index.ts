import { Firestore } from "@google-cloud/firestore";
import { queue } from "async";
import fs from "fs";

/**
 * Downloads all documents of a collection to local fs
 * @param {Firestore} firestore - a firestore instance
 * @param {string} collectionString - the string of the collection to download
 * @param {string} exportLocation - export location, default to ./export 
 */
const firestoreExport = async (firestore: Firestore, collectionString: string, exportLocation: string = "./export") => {
    return new Promise(async (res, rej) => {

        const collection = firestore.collection(collectionString);
        const testQuery = await collection.limit(1).get();

        if (testQuery.docs.length === 0) {
            throw new Error("COLLECTION_EMPTY");
        }

        // make sure that the directory exists
        fs.mkdirSync(exportLocation, {
            recursive: true,
        });

        interface IWriteObject {
            body: object;
            name: string;
            ext: string;
        }
        // fs queue, writes to file system, somewhat slowly.
        const writeQueue = queue((toWrite: IWriteObject, callback: () => void) => {
            const fullPath = `${exportLocation}/${toWrite.name}.${toWrite.ext}`;
            fs.writeFileSync(fullPath, JSON.stringify(toWrite.body, null, 2), {
                encoding: "utf8",
            });
            callback();
        });

        const isDebug = (String(process.env.DEBUG).toLowerCase() === "true");
        const documentLimit = isDebug ? 10 : 0;
        if (isDebug) {
            // tslint:disable-next-line
            console.log("DEBUG MODE, LIMITING TO 10 DOCUMENTS");
        }

        // there are documents in the query
        const blankQueryStream = collection.limit(documentLimit).stream();

        blankQueryStream.on("data", (document) => {
            const name = document.id;
            const body = document.data();
            writeQueue.push({
                body,
                ext: "json",
                name,
            });
        });

        // all files have been downloaded
        await writeQueue.drain();

        res();

    });

};

export default firestoreExport;
