"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

type Borrowers = {
    id: number;
    name: string;
    hiniramAmount: number;
    amountNaIbabalik: number;
    buwanNaHulog: number;
    totalPaymentMaid: number;
    monthly: number;
    isDone: boolean;
    balance: number;
}

type CashData = {
    totalMoneyLended: number;
    totalPaymentReceived: number;
    expectedMoneyReturn: number;
    totalNgPerangPinautang: number;
    totalExpectedAmount: number;
} 

type TestData = {
    borrowers: Borrowers [],
    cashData: CashData,
    availableId: number
}

const SampleData: TestData = {
    borrowers: [],
    cashData: {
        totalMoneyLended: 0,
        totalPaymentReceived: 0,
        expectedMoneyReturn: 0,
        totalNgPerangPinautang: 0,
        totalExpectedAmount: 0
    },
    availableId: 1
}

type ReportData = {
  pendingContracts: Borrowers [],
  completedContracts: Borrowers [],
  cashData: {
    completedNilabasNaPera: number;
    compltedBumalikNaPera: number;
    completedKinitangPera: number;
    pendingBinayadNaPera: number;
    perangBabalik: number;
  }
}

export default function Ticketmanagement() {
    const [data, setData] = useState(SampleData);
    const [report, setReportData] = useState<ReportData>({ pendingContracts: [], completedContracts: [], cashData: { completedNilabasNaPera: 0, compltedBumalikNaPera: 0, completedKinitangPera: 0, pendingBinayadNaPera: 0, perangBabalik: 0} });
    const [openSidebar, setOpenSidebar] = useState(false);
    const [hasRegistrationError, setHasRegistrationError] = useState({ show: false, errorMessage: ''});
    const [isCopied, setIsCopied] = useState(false);
    const [newPastedData, setNewPastedData] = useState<string>('');
    const [formData, setFormData] = useState<Borrowers>( {
        id: 0,
        name: '',
        hiniramAmount: 0,
        amountNaIbabalik: 0,
        buwanNaHulog: 0,
        totalPaymentMaid: 0,
        monthly: 0,
        isDone: false,
        balance: 0
    });

    useEffect(() => {
        if (localStorage.getItem('utangan') != null) {
            const locData = JSON.parse(localStorage.getItem("utangan") || "");

            setData(locData);
        }
    }, []) 

    useEffect(() => {
        localStorage.setItem("utangan", JSON.stringify(data))
    }, [data])

    const handlePayment = (b: Borrowers) => {
        const newData = { ...data };
        
        const newBorrowers = newData.borrowers.map(borrower => {
            if (borrower.id == b.id) {
              const isDone = borrower.totalPaymentMaid + 1 == borrower.buwanNaHulog ? true : false;

              if (isDone) {
                newData.cashData.totalPaymentReceived = newData.cashData.totalPaymentReceived - ((borrower.totalPaymentMaid + 1) * borrower.monthly);
              }

              return { 
                  ...borrower,  
                  totalPaymentMaid: borrower.totalPaymentMaid + 1, 
                  balance:  borrower.balance - borrower.monthly, 
                  isDone: isDone
              }
            }

            return borrower
        });
        
        

        const newCashData = {
            totalMoneyLended: newData.cashData?.totalMoneyLended,
            totalPaymentReceived: newData.cashData?.totalPaymentReceived + b.monthly,
            expectedMoneyReturn: newData.cashData?.expectedMoneyReturn - b.monthly,
            totalNgPerangPinautang: newData.cashData?.totalNgPerangPinautang,
            totalExpectedAmount: newData?.cashData?.totalExpectedAmount
        }

        setData({...newData, borrowers: newBorrowers, cashData: newCashData });
    }

    const renderReport = () => {
      const renderPending = ()=> {
        return (
          report?.pendingContracts?.map((c: Borrowers, ind: number) => (
            <div key={ind}>
              <h3>Name: {c?.name}</h3>
              <p>Balance: { formatCurrency(c?.balance)}</p>
            </div>
          ))
        )
      }
      const renderCompleted = ()=> {
        return (
          report?.completedContracts?.map((c: Borrowers, ind: number) => (
              <div key={ind}>
                <h3>Name: {c?.name}</h3>
                <p>Hiniram: { formatCurrency(c?.hiniramAmount)}</p>
                <p>Sinabing Amount: { formatCurrency(c?.amountNaIbabalik) }</p>
                <p>Kita: { formatCurrency(c?.amountNaIbabalik - c?.hiniramAmount) }</p>
              </div>
            )
          )
        )
      }

      return (
        <div>
          <h3 className="mb-10">Total Contracts: {data?.borrowers.length}</h3>
          <div className="mb-10">
            <h3>Total Pending: {report?.pendingContracts?.length != 0 && report?.pendingContracts?.length}</h3>
            <h3>{report?.cashData.pendingBinayadNaPera} / {report?.cashData.perangBabalik}</h3>
            { renderPending()}
          </div>
          <div className="mb-10">
            <h3>Total Completed: {report?.completedContracts?.length == 0 ? "No Completed Contracts" : report?.completedContracts?.length}</h3>
            <h3>Nilabas na Pera: { formatCurrency(report?.cashData?.completedNilabasNaPera) }  - { formatCurrency(report?.cashData?.compltedBumalikNaPera) } = <b>KINITA: { formatCurrency(report?.cashData?.completedKinitangPera) }</b></h3>
            { renderCompleted()}
          </div>         
        </div>
      )
    }

    const handleReport = () => {
      const newData = { ...data };
      const pendingContracts: Borrowers[] = [];
      const completedContracts: Borrowers[] = [];
      const newCashData = {
        completedNilabasNaPera: 0,
        compltedBumalikNaPera: 0,
        completedKinitangPera: 0,
        pendingBinayadNaPera: data?.cashData.totalPaymentReceived,
        perangBabalik: data?.cashData.expectedMoneyReturn
      }

      newData.borrowers?.map((borrower) => {
        if (borrower.isDone) {
          completedContracts.push({...borrower});
          newCashData.completedNilabasNaPera += borrower.hiniramAmount;
          newCashData.compltedBumalikNaPera += borrower.amountNaIbabalik;
          newCashData.completedKinitangPera += borrower.amountNaIbabalik - borrower.hiniramAmount
        } else {
          pendingContracts.push({...borrower});
        }
      })
      
      setReportData({...report, completedContracts: completedContracts, pendingContracts: pendingContracts, cashData: newCashData})
    }

    const openNewContractForm = () => {
        setOpenSidebar(true);
    }

    const addContract = () => {
        if (formData?.name == '' || formData.amountNaIbabalik == 0 || formData.hiniramAmount == 0 ) {
            setHasRegistrationError({...hasRegistrationError, errorMessage: 'Please complete fields', show: true});
            return false;
        }

        if ( formData.hiniramAmount > formData.amountNaIbabalik) {
            setHasRegistrationError({...hasRegistrationError, errorMessage: 'Mas malaki dapat ang ibabalik na pera', show: true});
            return false;
        }

        const newData = { ...data };
        const newFormData = { ...formData, balance: formData?.amountNaIbabalik, monthly: formData?.amountNaIbabalik / formData?.buwanNaHulog, id: newData?.availableId };
        const newCashData = {
            totalMoneyLended: newData?.cashData.totalMoneyLended + newFormData?.hiniramAmount,
            expectedMoneyReturn: newData.cashData.expectedMoneyReturn + newFormData?.amountNaIbabalik,
            totalPaymentReceived: newData?.cashData?.totalPaymentReceived,
            totalNgPerangPinautang: newData?.cashData?.totalNgPerangPinautang + newFormData.hiniramAmount,
            totalExpectedAmount: newData?.cashData?.totalExpectedAmount + newFormData?.amountNaIbabalik
        }

        newData.cashData = newCashData;
        newData.borrowers.unshift(newFormData);
        newData.availableId = newFormData?.id + 1;
        
        setFormData({
            id: 0,
            name: '',
            hiniramAmount: 0,
            amountNaIbabalik: 0,
            buwanNaHulog: 0,
            totalPaymentMaid: 0,
            monthly: 0,
            isDone: false,
            balance: 0
        });
        setData(newData); 
        setOpenSidebar(false);
        setHasRegistrationError({...hasRegistrationError, errorMessage: '', show: false})
    }

    const handleTopData = () => {
      return (
        <div className="bg-pink-800 p-5 top-0 fixed left-0 right-0">
            <h3 className="text-white flex flex-wrap justify-between">
              <div className="w-full"> Perang pinahiram:</div>
              <div className="w-1/2">Capital: {formatCurrency(data?.cashData?.totalMoneyLended)}</div> 
              <div className="w-1/2 text-right">With Interest: {formatCurrency(data?.cashData.totalExpectedAmount)}</div>
            </h3>
            <h3 className="text-white mt-5">Total ng Perang Sisingilin: { formatCurrency(data?.cashData?.expectedMoneyReturn) }</h3>
            <h3 className="text-white">Total ng Perang binayad: { data?.cashData?.expectedMoneyReturn == 0 && data?.cashData?.totalPaymentReceived == 0 ? data.borrowers?.length ? `All contracts are now paid` : `No contracts are being created` : formatCurrency(data?.cashData?.totalPaymentReceived) }</h3>
        </div>
      )
    }

    const copyJsonValue = () => {
      const newData = localStorage.getItem("utangan") || "";
      
      setIsCopied(true);
      navigator.clipboard.writeText(newData);
    }

    const setNewData = () => {
      setData(JSON.parse(newPastedData));
      setNewPastedData('');
      window?.location.reload();
    }

    return (
        <div className="main pb-[100px] pt-[160px]">
            <div className={`lendingSidebar bg-pink-200 ${openSidebar ? 'active' : ''}`}>
                <div className="form">
                    <div className="form_field">
                        <label htmlFor="" className="form_label">Full Name</label>
                        <input type="text" className="form_input" onChange={(e) => setFormData({...formData, name: e?.currentTarget.value})} />
                    </div>
                    <div className="form_field">
                        <label htmlFor="" className="form_label">Amount na Hihiramin</label>
                        <input type="number" className="form_input" onChange={(e) => setFormData({...formData, hiniramAmount: Number(e?.currentTarget.value)})} />
                    </div>
                    <div className="form_field">
                        <label htmlFor="" className="form_label">Amount na Ibabalik</label>
                        <input type="number" className="form_input" onChange={(e) => setFormData({...formData, amountNaIbabalik: Number(e?.currentTarget.value)})} />
                    </div>
                    <div className="form_field">
                        <label htmlFor="" className="form_label">Ilang beses huhulugan</label>
                        <input type="number" className="form_input" onChange={(e) => setFormData({...formData, buwanNaHulog: Number(e?.currentTarget.value)})} />
                    </div>
                    <div className="form_actions">
                        <button  className="w-full mb-2 bg-pink-800 px-3 py-3 text-white uppercase" onClick={ () => addContract() }>Add Contract</button>
                        <button  className="w-full bg-gray-700 px-3 py-3 text-white uppercase" onClick={ () => setOpenSidebar(false)}>Cancel</button>
                    </div>
                    <div className={`form_error mt-2 text-center uppercase text-white bg-red-700 p-2 ${hasRegistrationError.show ? 'block' : 'hidden'}`}>
                        <p>{hasRegistrationError?.errorMessage}</p>
                    </div>
                </div>
            </div>
            <div className="content">
                { handleTopData() }
                <div className="p-5 flex flex-wrap flex-col">
                    { data?.borrowers.map(b => (
                        <div className={`${b?.isDone ? "order-[999999]" : ""}`} key={b.id}>
                            <div className={`card ${b?.isDone ? 'bg-green-700' : 'bg-pink-100'} p-5 mb-5`}>
                                <h3>Name: {b?.name}</h3>
                                <div className="">
                                    <p>Contract: { b?.buwanNaHulog } Payments</p>
                                    <p>Inutang Amount: { formatCurrency(b?.hiniramAmount) }</p>
                                    <p>Usapang Ibabalik: { formatCurrency(b?.amountNaIbabalik) }</p>
                                    <p>Monthly Payment: { formatCurrency(b?.monthly) }</p>
                                    <p>Payment Status: { b?.totalPaymentMaid } / { b?.buwanNaHulog}</p>
                                    <p>Balance: { formatCurrency(b?.balance)} </p>
                                </div>
                                <div className="card_actions mt-5">
                                    { b?.isDone ? <button disabled className="w-full">Contract is done</button> : <button className="w-full bg-pink-800 px-3 py-3 text-white uppercase" onClick={ () => handlePayment(b)}>Add Payment</button>}
                                </div>
                            </div>
                        </div>
                    )) }
                </div>
                {/* <div className="mt-10 p-5 bg-blue-400">
                    { renderReport() } 
                    <button onClick={() => handleReport()}>Make report</button>
                </div> */}
                { data?.borrowers.length ? 
                  <div className="copy px-5 text-center">
                    <button className="w-full py-4 px-3 bg-red-400 text-white uppercase" onClick={() => copyJsonValue()}> { !isCopied ? "Copy Data Value" : "Copied!"}</button>
                  </div>
                  : null
                }

                <div className="insertData px-5 text-center mt-10">
                  <input type="text" className="form_input border-2" onChange={(e) => setNewPastedData(e.currentTarget.value)} />
                  <button className="mt-3 w-full py-4 px-3 bg-red-400 text-white uppercase" onClick={() => setNewData()}>Submit</button>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 ">
                <button onClick={() => openNewContractForm()} className="w-full py-4 px-3 bg-pink-800 text-white uppercase">Add New Contract</button>
            </div>
        </div>
    )
}