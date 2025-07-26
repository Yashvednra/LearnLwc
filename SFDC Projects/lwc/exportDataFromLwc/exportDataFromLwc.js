import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/getAccountRecords.getAccountRecords';
import JSPDF from '@salesforce/resourceUrl/jspdf';
import AUTOTABLE from '@salesforce/resourceUrl/autoTable';
import workbook from "@salesforce/resourceUrl/writeexcelfile";
import {loadStyle, loadScript} from 'lightning/platformResourceLoader';
 
export default class AccountTable extends LightningElement {
    accounts;
    jsPdfInitialized=false;
    selectedFormat = 'PDF';
    buttonLabel = 'Print PDF Format';
    
    // Picklist options for print format
    formatOptions = [
        { label: 'PDF', value: 'PDF' },
        { label: 'XLS', value: 'XLS' },
        { label: 'CSV', value: 'CSV' },
        { label: 'XLSX', value: 'XLSX' }
    ];
 
    // Wire the getAccounts method to fetch Account records
    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data?.accList;
        } else if (error) {
            console.error('Error fetching accounts:', error);
        }
    }

     renderedCallback(){ 
         
        if (this.jsPdfInitialized) {
            return;
        }
        Promise.all([
            loadScript(this,JSPDF),
            loadScript(this,workbook)
             
        ])
        .then(() => {
            loadScript(this,AUTOTABLE);
        })
        .catch((error)=>{
            throw error;
        });
        this.jsPdfInitialized = true;
    }
 
    // Handle format change
    handleFormatChange(event) {
        this.selectedFormat = event.target.value;
        this.buttonLabel = 'Print ' + event.target.value + ' Format';
    }
 
    // Handle print button click
    handlePrint() {
        if (this.selectedFormat === 'PDF') {
        
            this.exportToPdf(); 
            
        } else if (this.selectedFormat === 'XLS') {
            this.exportToExcel();
        }
        else if (this.selectedFormat === 'CSV') {
            this.exportTableToCsv();
        }
        else if (this.selectedFormat === 'XLSX') {
            this.exportToXLSX();
        }
    }
    //Code For PDF File
    exportToPdf(){
        if(!this.jsPdfInitialized){
            return;
        } 
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF(); 
        const table = this.template.querySelector('table'); 
        const rows = []; 
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText);  
        rows.push(headers); 
        this.accounts.forEach(acc => {
            rows.push([acc.Name, acc.Industry, acc.Rating,]);
        }); 
        doc.autoTable({
            head : [headers],
            body : rows.slice(1),
        }); 
        doc.save('accoutns.pdf');
    } 
    //Code for Xls File
    exportToExcel(){
        const table = this.template.querySelector('table'); 
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText); 

        let doc = '<table>';
        doc += '<tr>';

        headers.forEach(head =>{
            doc += '<th>' + head + '<th>';
        });
        doc += '<tr>';

        this.accounts.forEach(acc => {
            doc += '<tr>';
            doc += '<th>' + acc.Name + '<th>';
            doc += '<th>' + acc.Industry + '<th>';
            doc += '<th>' + acc.Rating + '<th>';
            doc += '<tr>';
        });
        doc += '<table>';

        var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
        let downloadElement = document.createElement('a');
        downloadElement.href = element;
        downloadElement.target  = '_self';
        downloadElement.download = 'accountData.xls';
        document.body.appendChild(downloadElement);
        downloadElement.click();
    }
    //Code For CSV File
     exportTableToCsv() {
        const table = this.template.querySelector('table');
        const rows = [];
        const headerCells = table.querySelectorAll('th');
        const headers = Array.from(headerCells).map(th => th.innerText);
        rows.push(headers);
 
        // Extract data
        this.accounts.forEach(account => {
            rows.push([account.Name, account.Industry, account.Rating]);
        });
    
        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");
             
 
        const encodedUri = encodeURI(csvContent);
        
        const link = document.createElement("a");
        
        link.setAttribute("href", encodedUri);
        
        link.setAttribute("download", "accounts.csv");
        
        document.body.appendChild(link); // Required for FF 
        
        link.click();
    }

    // calling the download function from xlsxMain.js
    async exportToXLSX() { 
        let _self = this; 
        var columns = [
            {
              column: 'Id',
              type: String,
              value: d => d.Id
            },
            {
              column: 'Account Name',
              type: String,
              value: d => d.Name
            },
            {
              column: 'Industry',
              type: String,
              color:'#880808',
              value: d => d.Industry
            },
            {
              column: 'Rating',
              type: String,
              value: d => d.Rating
            } 
        ];  
        await writeXlsxFile(_self.accounts, {
            schema: columns,
            fileName: 'accountFile.xlsx',
            headerStyle: {
                backgroundColor: '#1E2F97',
                fontWeight: 'bold',
                align: 'center',
                color:'#FFFFFF'
            }
        }) 
    }
     
}