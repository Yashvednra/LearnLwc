public class getAccountRecords {
    @AuraEnabled(cacheable=true)
    public static wrapperClass getAccountRecords(){
        wrapperClass wrp = new wrapperClass(); 
        List<Account> accList = 
        [ 
            Select 
                Id,Name, Industry, Rating 
            FROM Account
        ];
        wrp.accList = accList;
        return wrp;
    }
    
     @AuraEnabled(cacheable=true)
    public static wrapperClass getRecords(Integer pageSize , Integer pageNum){
        wrapperClass wrpr = new wrapperClass(); 
        Integer offSet= pageSize * (pageNum - 1);
        List<Account> accList =  
            [
                SELECT 
                       Id, Name 
                FROM Account 
                LIMIT :pageSize OFFSET :offSet
            ];
        System.Debug(accList);
        wrpr.accList = accList;
        return wrpr;
    }

    Class wrapperClass{
        @AuraEnabled
        public List<Account> accList;
    }

}