import jsTPS_Transaction from "../../common/jsTPS.js"
/**
 * AddSong_Transaction
 * 
 * This class represents a transaction that works with add songs.
 *  It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class AddSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, initIndex, initNewSongTitle, initNewSongArtist, initNewSongYouTubeId) {
        super();
        this.model = initModel;
        this.index = initIndex;
        this.songTitle = initNewSongTitle;
        this.songArtist = initNewSongArtist;
        this.songYouTubeId = initNewSongYouTubeId;
    }

    doTransaction() {
        this.model.addNewSong(this.index, this.songTitle, this.songArtist, this.songYouTubeId);
    }
    
    undoTransaction() {
        this.model.deleteSong(this.model.getSong(this.index));
    }
}