import jsTPS from "../common/jsTPS.js";
import Playlist from "./Playlist.js";
import AddSong_Transaction from "./transactions/AddSong_Transaction.js";
import EditSong_Transaction from "./transactions/EditSong_Transaction.js";
import MoveSong_Transaction from "./transactions/MoveSong_Transaction.js";
import RemoveSong_Transaction from "./transactions/removeSong_Transaction.js";

/**
 * PlaylisterModel.js
 * 
 * This class manages all playlist data for updating and accessing songs
 * as well as for loading and unloading lists. Note that editing should employ
 * an undo/redo mechanism for any editing features that change a loaded list
 * should employ transactions the jsTPS.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class PlaylisterModel {
    /*
        constructor

        Initializes all data for this application.
    */
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.playlists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;

        // THE MODAL IS NOT CURRENTLY OPEN
        this.confirmDialogOpen = false;

        //THIS IS A VARIABLE THAT IS TRUE IF CURRENT LIST IS BEING RENAMED
        this.renamePlayList = false;
    }

    // FOR MVC STUFF
    
    setView(initView) {
        this.view = initView;
    }

    refreshToolbar() {
        this.view.updateToolbarButtons(this);
    }
    
    // FIRST WE HAVE THE ACCESSOR (get) AND MUTATOR (set) METHODS
    // THAT GET AND SET BASIC VALUES NEEDED FOR COORDINATING INTERACTIONS
    // AND DISPLAY

    getList(index) {
        return this.playlists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.playlists.length; i++) {
            let list = this.playlists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    getSongIndex(wantedSong) {
        return this.currentList.songs.findIndex(song => song === wantedSong);
    }

    getPlaylistSize() {
        return this.currentList.songs.length;
    }

    getSong(index) {
        return this.currentList.songs[index];
    }

    getDeleteListId() {
        return this.deleteListId;
    }

    setDeleteListId(initId) {
        this.deleteListId = initId;
    }

    getDeleteSong() {
        return this.deleteSongYouTubeId;
    }

    setDeleteSong(initSong) {
        this.deleteSongYouTubeId = initSong;
    }
/*
    getRenamePlayList(){
        return this.renamePlayList;
    }
*/
    setRenamePlayList(initMode){
        this.renamePlayList = initMode;
    }
    

    toggleConfirmDialogOpen() {
        this.confirmDialogOpen = !this.confirmDialogOpen;
        this.view.updateToolbarButtons(this);
        return this.confirmDialogOpen;
    }

    // THESE ARE THE FUNCTIONS FOR MANAGING ALL THE LISTS

    addNewList(initName, initSongs) {
        let newList = new Playlist(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initSongs)
            newList.setSongs(initSongs);
        this.playlists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.playlists);
        return newList;
    }

    addNewSong(initIndex, initTitle, initArtist, initYouTubeId){
        if(this.currentList != null){
            let newSong = {
                "title": initTitle,
                "artist": initArtist,
                "youTubeId": initYouTubeId
            };
            this.currentList.songs.splice(initIndex, 0, newSong);
            this.view.refreshPlaylist(this.currentList);

            return newSong;
        }
    }

    sortLists() {
        this.playlists.sort((listA, listB) => {
            if (listA.getName().toUpperCase() < listB.getName().toUpperCase()) {
                return -1;
            }
            else if (listA.getName().toUpperCase() === listB.getName().toUpperCase()) {
                return 0;
            }
            else {
                return 1;
            }
        });
        this.view.refreshLists(this.playlists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.playlists.length; i++) {
            let list = this.playlists[i];
            this.view.unhighlightList(list.id); // Was : this.view.unhighlightList(i);
        }
    }

    loadList(id) {
        // If user attempts to reload the currentList, then do nothing.
        if (this.hasCurrentList() && id === this.currentList.id) {
            this.view.highlightList(id);
            return;
        }

        let list = null;
        let found = false;
        let i = 0;
        while ((i < this.playlists.length) && !found) {
            list = this.playlists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.refreshPlaylist(this.currentList);
                this.view.highlightList(id); // Was : this.view.highlightList(i);
                found = true;
            }
            i++;
        }
        this.tps.clearAllTransactions();
        this.view.updateStatusBar(this);
        this.view.updateToolbarButtons(this);
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.playlists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let songs = [];
                for (let j = 0; j < listData.songs.length; j++) {
                    songs[j] = listData.songs[j];
                }
                this.addNewList(listData.name, songs);
            }
            this.sortLists();   
            this.view.refreshLists(this.playlists);
            return true;
        }        
    }

    saveLists() {
        let playlistsString = JSON.stringify(this.playlists);
        localStorage.setItem("recent_work", playlistsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    unselectCurrentList() {
        if (this.hasCurrentList()) {
            this.currentList = null;
            this.view.updateStatusBar(this);
            this.view.clearWorkspace();
            this.tps.clearAllTransactions();
            this.view.updateToolbarButtons(this);
        }
    }

    renameCurrentList(initName, id) {
        if (this.hasCurrentList()) {
            let targetList = this.playlists[this.getListIndex(id)];

            if (initName === "") {
                targetList.setName("Untitled");
            } else {
                targetList.setName(initName);
            }

            this.sortLists(); 
            this.view.highlightList(id);
            this.saveLists();
            this.view.updateStatusBar(this);

            
        }
    }

    deleteList(id) {
        let toBeDeleted = this.playlists[this.getListIndex(id)];
        this.playlists = this.playlists.filter(list => list.id !== id);
        this.view.refreshLists(this.playlists)
        // 2 cases, deleted is current list
        // deleted is not current list
        if (toBeDeleted == this.currentList) {
            this.currentList = null;
            this.view.clearWorkspace();
            this.tps.clearAllTransactions();
            this.view.updateStatusBar(this);
        } else if (this.hasCurrentList()) {
            this.view.highlightList(this.currentList.id);
        }
        this.saveLists();
    }

    deleteSong(songToBeDeleted) {
        //let previousPlaylistLength = this.getPlaylistSize();
        this.currentList.songs = this.currentList.songs.filter(currentSong => currentSong !== songToBeDeleted);
        //this.currentList.songs = this.currentList.songs.splice(songIndex, 1);
        this.view.refreshPlaylist(this.currentList);
        // 2 cases, deleted song is in the current list
        // deleted song is not in the current list
        
        /*
        if (previousPlaylistLength == this.getPlaylistSize()) {
            //this.currentList = null;
            this.view.clearWorkspace();
            this.tps.clearAllTransactions();
            this.view.updateStatusBar(this);
        } else if (this.hasCurrentList()) {
            this.view.highlightList(this.currentList.id);
        }
        */
        this.saveLists();
        
    }

    updateSong(songIndex, titleText, artistText, youTubeIdText) {
        this.getSong(songIndex).title = titleText;
        this.getSong(songIndex).artist = artistText;
        this.getSong(songIndex).youTubeId = youTubeIdText;

        this.view.refreshPlaylist(this.currentList);
        this.saveLists();
    }

    // NEXT WE HAVE THE FUNCTIONS THAT ACTUALLY UPDATE THE LOADED LIST

    moveSong(fromIndex, toIndex) {
        if (this.hasCurrentList()) {
            let tempArray = this.currentList.songs.filter((song, index) => index !== fromIndex);
            tempArray.splice(toIndex, 0, this.currentList.getSongAt(fromIndex))
            this.currentList.songs = tempArray;
            this.view.refreshPlaylist(this.currentList);
        }
        this.saveLists();
    }

    // SIMPLE UNDO/REDO FUNCTIONS, NOTE THESE USE TRANSACTIONS

    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    // NOW THE FUNCTIONS THAT CREATE AND ADD TRANSACTIONS
    // TO THE TRANSACTION STACK

    addMoveSongTransaction(fromIndex, onIndex) {
        let transaction = new MoveSong_Transaction(this, fromIndex, onIndex);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

    //ADDS A NEW ADDSONG_TRANSACTION TO THE STACK
    addAddSongTransaction(index, newSongTitle, newSongArtist, newSongYouTubeId){
        let transaction = new AddSong_Transaction(this, index, newSongTitle, newSongArtist, newSongYouTubeId);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

     //ADDS A NEW REMOVESONG_TRANSACTION TO THE STACK
     addRemoveSongTransaction(removeSong){
        let transaction = new RemoveSong_Transaction(this, this.getSongIndex(removeSong), removeSong);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

    //ADDS A NEW EDITSONG_TRANSACTION TO THE STACK
    addEditSongTransaction(index, titleText, artistText, youTubeIdText){
        //let transaction = new EditSong_Transaction
        let transaction = new EditSong_Transaction(this, index, titleText, artistText, youTubeIdText);
        //let transaction = new RemoveSong_Transaction(this, this.getSongIndex(removeSong), removeSong);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }
}