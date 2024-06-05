document.addEventListener("DOMContentLoaded",()=>{
    const createModalButton = document.getElementById("create-journal");

    createModalButton.addEventListener("click",function(){
        if(createModalButton){
            const newModal = document.createElement('modal-journal');
            document.body.appendChild(newModal);
        }
    });

});