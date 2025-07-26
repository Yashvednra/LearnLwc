// FreezeUserController.cls
public with sharing class FreezeUserController {
    @AuraEnabled(cacheable=true)
    public static List<User> getFrozenUsers() {
        return [SELECT Id, Name, Email,UserRole.Name FROM User WHERE IsActive = false];
    }
}