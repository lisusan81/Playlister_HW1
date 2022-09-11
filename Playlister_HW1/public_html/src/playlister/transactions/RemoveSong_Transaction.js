import jsTPS_Transaction from "../../common/jsTPS.js"
/**
 * RemoveSong_Transaction
 * 
 * This class represents a transaction that works with removing songs.
 * It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class RemoveSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, initIndex, initSong) {
        super();
        this.model = initModel;
        this.index = initIndex;
        this.songTitle = initSong.title;
        this.songArtist = initSong.artist;
        this.songYouTubeId = initSong.youTubeId;
    }

    doTransaction() {
        this.model.deleteSong(this.model.getSong(this.index));
    }
    
    undoTransaction() {
        this.model.addNewSong(this.index, this.songTitle, this.songArtist, this.songYouTubeId);
    }
}