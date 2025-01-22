import React, { useState, useEffect  } from "react";

type Kanban = {
  id: string;
  title: string;
};

type dataCard = {
  id: number,
  column_id: string,
  name: string,
  description: string,
  team: string[] | [],
  createdAt: Date,
  updatedAt: Date,
};

export const useLayoutBoard = () => {
  const [data, setData] = useState<Kanban[]>([]) 

  useEffect(() => {
  setData([
    {
      id: 'TODO',
      title: 'TO DO'
    },
    {
      id: 'DOING',
      title: 'DOING'
    },
    {
      id: 'DONE',
      title: 'DONE'
    }
  ])
  }, []);

  return data;
}

export const useDataCard = () => {
  const [cardData, setCardData] = useState<dataCard[]|[]>([]); 

  const fetchCardData = async () => {
    try {
      const response = await fetch(
        "https://678f5e8249875e5a1a918add.mockapi.io/api/kanban/cards"
      );
      const data = await response.json();
      data.sort((a: dataCard, b: dataCard) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB  = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      });
      setCardData(data);
    } catch(error){
      console.error('ERROR: ', error)
    }
  }

  useEffect(() => {
    fetchCardData();
  }, []);

  return {
    cardData,
    fetchCardData
  };
}
