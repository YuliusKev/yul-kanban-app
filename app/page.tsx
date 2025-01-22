'use client'
import React, { useEffect, useState, FormEvent, ChangeEvent  } from "react";
import { useRouter } from 'next/navigation';
import { useLayoutBoard, useDataCard } from "./components/dataObject"; 

type dataCard = {
  id: number,
  column_id: string,
  name: string,
  description: string,
  team: string[] | [],
  createdAt: Date,
  updatedAt: Date,
};

type submitStatus = 'new' | 'edit';

type inputCard = {
  column_id: string,
  name: string,
  description: string,
  team: string[] | [],
}

const colorMap: Record<string, string> = {
  DESIGN: 'bg-green-700',
  BACKEND: 'bg-blue-700',
  FRONTEND: 'bg-red-700',
};

export default function Home() {
  const layoutBoard = useLayoutBoard();
  const { cardData, fetchCardData } = useDataCard();
  const router = useRouter();

  const [selectedData, setSelectedData] = useState<dataCard>({
    id: 0,
    column_id: '',
    name: '',
    description: '',
    team: [],
    createdAt: new Date,
    updatedAt: new Date,
  })
  const [modal, setModal]  = useState(false)
  const [submitStatus, setSubmitStatus] = useState<submitStatus>('new')
  const [formModal, setFormModal]  = useState(false)
  const [detailModal, setDetailModal] = useState(false);
  
  const [cards, setCards] = useState(cardData)
  const [dragElement, setDragElement] = useState<{id: number | null | undefined, card_id: string} | null>(null)
  const [name, setName] = useState('')

  const [allTeams, setAllTeams] = useState<string[]>([]);
  

  const [formData, setFormData] = useState<inputCard>({
    name: '',
    description: '',
    column_id: '',
    team: [],
  });

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    setCards(cardData)
    if(!userId){
      router.push('/login');
    } else {
      setName(userId.charAt(0).toUpperCase() + userId.slice(1).substring(0, 4))
    }
  })

  const onDragCard = (id: number, card_id: string) => {
    setDragElement({
      id,
      card_id
    })
    // console.log("Drag Card ", id, ' to ', card_id);  
  }

  const onDropCard = (column_id: string) => {
    handleDragChange(column_id, dragElement?.id)
    setCards([
      ...cards.map((item) => {
        if(dragElement?.id == item.id){
          item.column_id = column_id;
        }

        return item;
      })
    ])
    // if(dragElement){
      // const theCard = cards.filter((card) => card.id === dragElement.id);
      // console.log(theCard[0])
      // const updatedCard = [...cards.filter((card) => card.column_id === column_id), ...theCard];
    // }
  }

  const handleDragChange = async (column_id: string, card_id: number | null | undefined) => {
    try{
      const date = new Date
      console.log(card_id)
      const url = `https://678f5e8249875e5a1a918add.mockapi.io/api/kanban/cards/${card_id}`
      const response = await fetch(
        url,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            column_id: column_id,
            updatedAt: date
          }),
        }
      );
      const result = await response.json();
      if(result){
        alert(`Card Status Succesfully change to ${column_id}`);
      }
    } catch(error: any){
      console.error('Error submitting data:', error);
      alert(`Error submitting data: ${error.message }`);
    } 
  }
  const formatDate = (dateInput: string | number | Date): string => {
    const date = new Date(dateInput);
  
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
  
    return date.toLocaleDateString('id-ID', options);
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue:string = e.target.value;
    setFormData({
      ...formData,
      column_id: selectedValue,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please fill out all fields.');
    } else {
      // You can submit the data here
      const date = new Date
      try{
        const url = (submitStatus == 'new') ? 'https://678f5e8249875e5a1a918add.mockapi.io/api/kanban/cards' : `https://678f5e8249875e5a1a918add.mockapi.io/api/kanban/cards/${selectedData.id}`
        const response = await fetch(
          url,
          {
            method: (submitStatus == 'new') ? 'POST' : 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              column_id: formData.column_id,
              name: formData.name,
              description: formData.description,
              team: allTeams,
              createdAt: (submitStatus == 'new') ? date : selectedData.createdAt,
              updatedAt: date
            }),
          }
        );
        const result = await response.json();
        if(result){
          fetchCardData();
          setFormModal(false)
          const alertText = (submitStatus == 'new') ? 'New Card has submitted successfully!' : `Your Card has been succesfully updated!`
          setFormData({
            name: '',
            description: '',
            column_id: '',
            team: [],
          });
          setAllTeams([]);
          setTimeout(() => {
            alert(alertText);
          }, 100);
        }

       
      } catch(error: any){
        console.error('Error submitting data:', error);
        alert(`Error submitting data: ${error.message }`);
      } 
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://678f5e8249875e5a1a918add.mockapi.io/api/kanban/cards/${selectedData.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if(result){
        setTimeout(() => {
          alert(`Task card ${selectedData.name} succesfully deleted!`);
        }, 100);
        setModal(false);
        setSelectedData({
          id: 0,
          column_id: '',
          name: '',
          description: '',
          team: [],
          createdAt: new Date,
          updatedAt: new Date,
        })
        setDetailModal(false)
        fetchCardData();
      }


    } catch(error: any){
      console.error('Error deleting data:', error);
      alert(`Error deleting data: ${error.message }`);
    }
  }

  const openInputForm = (card_id: string) => {
    setFormData({
      ...formData,
      column_id: card_id
    })
    setFormModal(true);
    setSubmitStatus('new');
  }

  const updateTeam = (status_name: string, status_index: number) => {
    if(allTeams.includes(status_name)){
      setAllTeams(prevTeam => prevTeam.filter(item => item !== status_name))
    } else {
      setAllTeams([...allTeams, status_name])
    }

  }

  const selectCard = (card_data: dataCard) => {
    setSelectedData(card_data);
    setDetailModal(true);
  }

  const openEdit = () => {
    setSubmitStatus('edit')
    setDetailModal(false);
    setFormData({
      name: selectedData.name,
      description: selectedData.description,
      column_id: selectedData.column_id,
      team: selectedData.team,
    })
    setAllTeams(selectedData.team)
    setFormModal(true); 
  }

  const resetInputValue = () => {
    setFormData({
      name: '',
      description: '',
      column_id: '',
      team: [],
    });
    setFormModal(false)
    setAllTeams([])
  }

  const logoutSesh = () => {
    sessionStorage.removeItem('userId');
    router.push('/login');
  }

  return (
    <>
      <div className="py-4 px-4 flex justify-between space-center bg-green-100">
        <h1 className="text-4xl font-bold">Kanban Board</h1>
        <div>
          {name && <p className="text-xl">Hi, {name}</p>}
          <a rel="stylesheet" href="#" onClick={() => logoutSesh()} className="text-blue-900">Logout</a>
        </div>
      </div>
      <div className="py-8 px-2 justify-between space-center flex bg-amber-200">
        {layoutBoard.map((kanban) => (
            <div key={kanban.id} className="w-full bg-gray-100 p-2 mr-2 h-screen rounded-lg">
              <div className="flex justify-between space-center py-3">
                <p className="text-3xl font-bold">{kanban.title}</p>
                {<button 
                  onClick={() => openInputForm(kanban.id)}
                  className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
                >
                  +
                </button>}
               
              </div>
              <div className="h-full overflow-auto p-2 rounded-lg" style={{background: '#0059b3'}} onDragOver={(e) => {e.preventDefault()}} onDrop={()=> onDropCard(kanban.id)}>
                {
                  cards.filter((card) => card.column_id === kanban.id).map((c) =>(
                    <div className="mt-5 bg-white rounded h-40 p-3 cursor-pointer overflow-auto" key={c.id} draggable onDrag={() => onDragCard(c.id, kanban.id)} onClick={()=> selectCard(c)}>
                      <div className="flex justify-between align-center">
                        <div className="w-80">
                          <p className="break-all text-xl font-semibold">{c.name}</p>
                        </div>
                      </div>
                      {c.team.length > 0 && 
                      <div className="mt-10 flex align-center">
                        <p className="text-xl pr-3">Assigned Team:</p> 
                        <div className="flex">
                        {c?.team.map((value, index) => {
                              return (
                                <div key={index} className={`rounded-md mr-2 border border-slate-300 ${colorMap[value]} text-white py-0.5 px-2.5 text-center text-sm transition-all shadow-sm`}
                                >
                                  {value}
                                </div>
                              )
                          }
                        )}
                        </div>
                      </div>}
                     
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b p-4">
              <div className="pr-2">
                <h3 className="text-lg font-semibold">Are you sure want to delete task {selectedData?.name}</h3>
              </div>
              <button
                onClick={() => setModal(false)}
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                ✕
              </button>
            </div>
            {/* Modal Footer */}
            <div className="flex justify-end border-t p-4">
              <button
                onClick={() => handleDelete()}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 mr-4"
              >
                Yes
              </button>
              <button
                onClick={() => setModal(false)}
                className="px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {formModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tambah Card</h3>
              <button
                onClick={() => resetInputValue()}
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-xl">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700 text-xl">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor="column_id" className="block text-gray-700 text-xl">Task Status</label>
                  <select
                    id="column_id"
                    name="column_id"
                    value={formData.column_id}
                    onChange={handleSelectionChange}
                    className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="TODO">TO DO</option>
                    <option value="DOING">DOING</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="selection" className="block text-gray-700 text-xl">Assigned Team</label>
                  <div className="flex">
                  {
                    <div className="flex pt-2">
                      <div className={`rounded-md mr-2 cursor-pointer border border-slate-300 ${(allTeams.find((status) => status == 'DESIGN')) ? 'bg-green-700 text-white' : 'text-slate-600'} py-0.5 px-2.5 text-center text-sm transition-all shadow-sm`} onClick={()=>{updateTeam('DESIGN', 0)}}
                      >
                        DESIGN
                      </div>
                      <div className={`rounded-md mr-2 cursor-pointer border border-slate-300 ${(allTeams.find((status) => status == 'BACKEND')) ? 'bg-blue-700 text-white' : 'text-slate-600'} py-0.5 px-2.5 text-center text-sm transition-all shadow-sm`} onClick={() => {updateTeam('BACKEND', 1)}}
                        >
                          BACKEND
                        </div>
                      <div className={`rounded-md border cursor-pointer  border-slate-300 ${(allTeams.find((status) => status == 'FRONTEND')) ? 'bg-red-700 text-white' : 'text-slate-600'} py-0.5 px-2.5 text-center text-sm transition-all shadow-sm`} onClick={() => {updateTeam('FRONTEND', 2)}}>
                          FRONTEND
                        </div>
                    </div>
                  }
                    
                  </div>
                </div>
                {/* Modal Footer */}
                <div className="flex justify-end border-t p-4">
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Submit
                  </button>
                </div>
            </form> 
          </div>
        </div>
      )}

      {detailModal && (
         <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-5">
            <div className="flex justify-end items-center mb-4">
              <button
                onClick={() => setDetailModal(false)}
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                ✕
              </button>
            </div>
            <div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700">Name</label>
                <p className="text-lg">{selectedData?.name}</p>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700">Description</label>
                <p className="text-lg">{selectedData?.description}</p>
              </div>

              <div className="mb-4">
                <label htmlFor="column_id" className="block text-gray-700">Task Status</label>
                <p className="text-lg">{(selectedData?.column_id == 'TODO') ? 'TO DO' : selectedData.column_id}</p>
              </div>

              <div className="mb-4">
                <label htmlFor="selection" className="block text-gray-700">Assigned Team</label>
                <div className="flex">
                  {selectedData?.team.map((value, index) => {
                        return (
                          <div key={index} className={`rounded-md mr-2 border border-slate-300 ${colorMap[value]} text-white py-0.5 px-2.5 text-center text-sm transition-all shadow-sm`}
                          >
                            {value}
                          </div>
                        )
                    }
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Created At</label>
                <p className="text-lg">{formatDate(selectedData?.createdAt)}</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Updated At</label>
                <p className="text-lg">{formatDate(selectedData?.updatedAt)}</p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end border-t p-4">
                <button className="px-4 py-2 mr-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300" onClick={()=>{openEdit()}}>edit</button>
                <button className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300" onClick={()=>{setModal(true)}}>delete</button>
              </div>
            </div> 
          </div>
        </div>
      )}
    </>
  );
}
