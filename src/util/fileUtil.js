import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export const forcesPath = "eschatonic-well/forces/";
export const racksPath = "eschatonic-well/racks/";
export const forcesExtension = ".esch";
export const racksExtension = ".rack";

export const forceFormatVersion = "0.2.0";
export const rackFormatVersion = "0.2.0";

export const createDir = async (path) => {
    try {
        const result = await Filesystem.mkdir({
            path: path,
            directory: Directory.Documents,
            recursive: true
        });
        
        return result;
    }  catch (e) {
        console.error(e);
    }
};

export const listFiles = async (path) => {
    try {
        const result = await Filesystem.readdir({
            path: path,
            directory: Directory.Documents
        });
        
        return result;
    } catch (e) {
        try {
            await createDir(path);            
            const result = await Filesystem.readdir({
                path: path,
                directory: Directory.Documents
            });
            
            return result;
        } catch (e) {
            console.error(e);
        }
    }
};

export const getFormatVersionFromFile = async (path, filename) => {
    try {
        const result = await Filesystem.readFile({
            path: `${path}${filename}`,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        
        const json = JSON.parse(result.data);
        return json.formatVersion;
    } catch (e) {
        console.error(e);
    }
};

export const getFactionIdFromFile = async (path, filename) => {
    try {
        const result = await Filesystem.readFile({
            path: `${path}${filename}`,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        
        const json = JSON.parse(result.data);
        return json.factionId;
    } catch (e) {
        console.error(e);
    }
};

export const getRulesetIdFromFile = async (path, filename) => {
    try {
        const result = await Filesystem.readFile({
            path: `${path}${filename}`,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        
        const json = JSON.parse(result.data);
        return json.rulesetId;
    } catch (e) {
        console.error(e);
    }
};