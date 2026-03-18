import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Char "mo:core/Char";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module GP {
    public type Department = {
      #sales;
      #hr;
      #finance;
      #operations;
      #engineering;
      #marketing;
    };

    public type AttendanceStatus = {
      #present;
      #absent;
    };

    public type Salary = {
      basic : Float;
      allowances : Float;
      deductions : Float;
      net : Float;
    };

    public type ContractType = {
      #in_ : { client : Text };
      #out : { vendor : Text };
    };

    public type ContractStatus = {
      #active;
      #completed;
      #cancelled;
    };

    public type IncomeEntry = {
      date : Time.Time;
      category : Text;
      description : Text;
      amount : Float;
    };

    public type ExpenseEntry = {
      date : Time.Time;
      category : Text;
      description : Text;
      amount : Float;
    };

    public type Employee = {
      id : Nat;
      name : Text;
      department : Department;
      active : Bool;
    };

    public type Contract = {
      id : Nat;
      title : Text;
      contractType : ContractType;
      value : Float;
      contractStatus : ContractStatus;
      startDate : Time.Time;
      endDate : Time.Time;
    };
  };

  module Attendance {
    public type Record = {
      employeeId : Nat;
      date : Time.Time;
      status : GP.AttendanceStatus;
    };

    public func compare(_ : Record, _ : Record) : Order.Order {
      #equal;
    };
  };

  module Salary {
    public type Record = {
      employeeId : Nat;
      year : Int;
      month : Nat;
      details : GP.Salary;
    };

    public func compare(_ : Record, _ : Record) : Order.Order {
      #equal;
    };
  };

  module Contract {
    public type Record = {
      id : Nat;
      title : Text;
      details : GP.Contract;
      contractType : GP.ContractType;
    };

    public func compareByTitle(r1 : Record, r2 : Record) : Order.Order {
      Text.compare(r1.title, r2.title);
    };
  };

  module Analysis {
    public type Result = {
      totalEmployees : Nat;
      totalPresentToday : Nat;
      monthlyPayrollTotal : Float;
      activeContractsCount : Nat;
      monthlyNetProfit : Float;
    };
  };

  public type UserProfile = {
    name : Text;
    employeeId : ?Nat;
  };

  let contracts = Map.empty<Nat, GP.Contract>();
  let employees = Map.empty<Nat, GP.Employee>();
  let expenses = Map.empty<Nat, GP.ExpenseEntry>();
  let incomes = Map.empty<Nat, GP.IncomeEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToEmployeeId = Map.empty<Principal, Nat>();

  let nextContractId = Set.empty<Nat>();
  let nextEmployeeId = Set.empty<Nat>();
  let nextExpenseId = Set.empty<Nat>();
  let nextIncomeId = Set.empty<Nat>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Contract Management
  public query ({ caller }) func getContract(id : Nat) : async GP.Contract {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get contracts");
    };
    switch (contracts.get(id)) {
      case (null) { Runtime.trap("Contract does not exist") };
      case (?c) { c };
    };
  };

  func toUppercase(text : Text) : Text {
    text.map(func(c) { if (c >= 'a' and c <= 'z') { Char.fromNat32(c.toNat32() - 32) } else { c } });
  };

  public shared ({ caller }) func addContract(title : Text, contractType : GP.ContractType, value : Float, startDate : Time.Time, endDate : Time.Time, status : GP.ContractStatus) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add contracts");
    };

    let id = nextContractId.size() + 1;
    nextContractId.add(id);

    let contract : GP.Contract = {
      id;
      title;
      contractType;
      value;
      contractStatus = status;
      startDate;
      endDate;
    };

    contracts.add(id, contract);
    id;
  };

  public query ({ caller }) func getContractByTitle(title : Text) : async [Contract.Record] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can search contracts");
    };
    let filtered = contracts.entries().toArray().filter(
      func(entry) {
        let contract = entry.1;
        toUppercase(contract.title).contains(#text(toUppercase(title)));
      }
    );
    filtered.map(func(entry) { { id = entry.0; title = entry.1.title; contractType = entry.1.contractType; details = entry.1 } });
  };

  public query ({ caller }) func searchContractByTitle(title : Text) : async [Contract.Record] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can search contracts");
    };
    let filtered = contracts.entries().toArray().filter(
      func(entry) {
        let contract = entry.1;
        contract.title.contains(#text(title));
      }
    );
    filtered.map(
      func(entry) {
        {
          id = entry.0;
          title = entry.1.title;
          contractType = entry.1.contractType;
          details = entry.1;
        };
      }
    );
  };

  // Employee Management
  public shared ({ caller }) func addEmployee(name : Text, department : GP.Department) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add employees");
    };

    let id = nextEmployeeId.size() + 1;
    nextEmployeeId.add(id);

    let employee : GP.Employee = {
      id;
      name;
      department;
      active = true;
    };

    employees.add(id, employee);
    id;
  };

  public query ({ caller }) func getEmployee(id : Nat) : async GP.Employee {
    // Admin can view any employee, or employee can view their own record
    let isOwnRecord = switch (principalToEmployeeId.get(caller)) {
      case (?empId) { empId == id };
      case (null) { false };
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #admin)) and not isOwnRecord) {
      Runtime.trap("Unauthorized: Can only view your own employee record");
    };

    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee does not exist") };
      case (?employee) { employee };
    };
  };

  public shared ({ caller }) func linkEmployeeToPrincipal(employeeId : Nat, principal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can link employees to principals");
    };

    switch (employees.get(employeeId)) {
      case (null) { Runtime.trap("Employee does not exist") };
      case (?_) {
        principalToEmployeeId.add(principal, employeeId);
      };
    };
  };

  // Expense Management
  public shared ({ caller }) func addExpense(date : Time.Time, category : Text, description : Text, amount : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add expenses");
    };

    let id = nextExpenseId.size() + 1;
    nextExpenseId.add(id);

    let expense : GP.ExpenseEntry = {
      date;
      category;
      description;
      amount;
    };

    expenses.add(id, expense);
    id;
  };

  public query ({ caller }) func getExpense(id : Nat) : async GP.ExpenseEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view expenses");
    };
    switch (expenses.get(id)) {
      case (null) { Runtime.trap("Expense does not exist") };
      case (?expense) { expense };
    };
  };

  // Income Management
  public shared ({ caller }) func addIncome(date : Time.Time, category : Text, description : Text, amount : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add incomes");
    };

    let id = nextIncomeId.size() + 1;
    nextIncomeId.add(id);

    let income : GP.IncomeEntry = {
      date;
      category;
      description;
      amount;
    };

    incomes.add(id, income);
    id;
  };

  public query ({ caller }) func getIncome(id : Nat) : async GP.IncomeEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view incomes");
    };
    switch (incomes.get(id)) {
      case (null) { Runtime.trap("Income does not exist") };
      case (?income) { income };
    };
  };
};
