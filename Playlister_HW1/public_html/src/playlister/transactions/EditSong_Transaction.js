import jsTPS_Transaction from "../../common/jsTPS.js"
/**
 * EditSong_Transaction
 * 
 * This class represents a transaction that works with editing songs.
 * It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, initIndex, initPreviousSongData, initNewSongData) {
        super();
        this.model = initModel;
        this.index = initIndex;

        //initPreviousSongData is an array of length=3, which stores the previous information for the song
        //initPreviousSongData = [previousSongTitle, previousSongArtist, previousSongYouTubeId]
        this.prevSongTitle = initPreviousSongData[0];
        this.prevSongArtist = initPreviousSongData[1];
        this.prevSongYouTubeId = initPreviousSongData[2];

        //initNewSongData is an array of length=3, which stores the new information for the song
        //initNewSongData = [newSongTitle, newSongArtist, newSongYouTubeId]
        this.newSongTitle = initNewSongData[0];
        this.newSongArtist = initNewSongData[1];
        this.newSongYouTubeId = initNewSongData[2];
    }

    doTransaction() {
        this.model.updateSong(this.index, this.newSongTitle, this.newSongArtist, this.newSongYouTubeId);
    }
    
    undoTransaction() {
        this.model.updateSong(this.index, this.prevSongTitle, this.prevSongArtist, this.prevSongYouTubeId);
    }
}