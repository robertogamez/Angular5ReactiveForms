import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { Customer } from './customer';

function ratingRange(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): {[key: string]: boolean} | null => {
  
        if(c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)){
            return { 'range': true };
        }
    
        return null;
    }
}

@Component({
    selector: 'my-signup',
    templateUrl: './customer.component.html'
})
export class CustomerComponent implements OnInit  {
    customerForm: FormGroup;
    customer: Customer= new Customer();

    constructor(
        private fb: FormBuilder
    ){

    }

    ngOnInit(): void {

        this.customerForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email: ['', [Validators.required, Validators.email]],
                confirmEmail: ['', [Validators.required]]
            }),
            phone: '',
            rating: [null, ratingRange(1, 5)],
            notification: 'email',
            sendCatalog: true
        });
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    populateTestData(): void {
        this.customerForm.setValue({
            firstName: 'Robert',
            lastName: 'Manuel',
            email: 'roberto@gmail.com',
            sendCatalog: true
        });
    }

    setNotification(notifyVia: string) : void {
        const phoneControl = this.customerForm.get('phone');
        if(notifyVia === 'text'){
            phoneControl.setValidators(Validators.required);
        } else {
            phoneControl.clearValidators();
        }

        phoneControl.updateValueAndValidity();
    }

 }
